import os
from bson import ObjectId

# Set absolute path for local db.json persistence
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BACKEND_DIR, "db.json")


class InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class DeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count
        self.raw_result = {"n": deleted_count, "ok": 1.0}


class MockCursor:
    def __init__(self, docs):
        self.docs = docs
        self.index = 0

    def sort(self, key, direction=-1):
        reverse = direction == -1
        def get_val(doc):
            val = doc.get(key)
            if val is None:
                return ""
            return val
        
        self.docs = sorted(self.docs, key=get_val, reverse=reverse)
        return self

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.index >= len(self.docs):
            raise StopAsyncIteration
        val = self.docs[self.index]
        self.index += 1
        return val


class MockCollection:
    def __init__(self, name, db):
        self.name = name
        self.db = db

    def _get_all(self):
        data = self.db._read_data()
        return data.setdefault(self.name, [])

    def _save_all(self, docs):
        data = self.db._read_data()
        data[self.name] = docs
        self.db._write_data(data)

    def _matches(self, doc, query):
        for k, v in query.items():
            if k == "_id":
                doc_id = doc.get("_id") or doc.get("id")
                if str(doc_id) != str(v):
                    return False
                continue

            if k not in doc:
                return False

            doc_val = doc[k]
            if isinstance(v, dict):
                for op, op_val in v.items():
                    if op == "$gte" and not (doc_val >= op_val):
                        return False
                    if op == "$lte" and not (doc_val <= op_val):
                        return False
                continue

            if str(doc_val) != str(v):
                return False
        return True

    async def find_one(self, query, sort=None):
        docs = self._get_all()
        matched = [d for d in docs if self._matches(d, query)]
        if not matched:
            return None
        
        if sort:
            for field, order in sort:
                reverse = order == -1
                matched = sorted(matched, key=lambda x: x.get(field, ""), reverse=reverse)
        
        return matched[0]

    async def insert_one(self, doc):
        docs = self._get_all()
        if "_id" not in doc:
            doc["_id"] = str(ObjectId())
        doc_copy = dict(doc)
        from datetime import datetime, date
        for k, v in list(doc_copy.items()):
            if isinstance(v, (datetime, date)):
                doc_copy[k] = v.isoformat()
            elif isinstance(v, ObjectId):
                doc_copy[k] = str(v)
        docs.append(doc_copy)
        self._save_all(docs)
        return InsertOneResult(doc_copy["_id"])

    async def update_one(self, query, update):
        docs = self._get_all()
        updated_count = 0
        for doc in docs:
            if self._matches(doc, query):
                if "$set" in update:
                    for uk, uv in update["$set"].items():
                        if isinstance(uv, list):
                            doc[uk] = [dict(item) if hasattr(item, "model_dump") or isinstance(item, dict) else item for item in uv]
                        else:
                            doc[uk] = uv
                updated_count += 1
                break
        if updated_count > 0:
            self._save_all(docs)
        return DeleteResult(updated_count)

    async def delete_one(self, query):
        docs = self._get_all()
        deleted_count = 0
        for i, doc in enumerate(docs):
            if self._matches(doc, query):
                docs.pop(i)
                deleted_count = 1
                break
        if deleted_count > 0:
            self._save_all(docs)
        return DeleteResult(deleted_count)

    async def delete_many(self, query):
        docs = self._get_all()
        original_len = len(docs)
        docs = [d for d in docs if not self._matches(d, query)]
        deleted_count = original_len - len(docs)
        if deleted_count > 0:
            self._save_all(docs)
        return DeleteResult(deleted_count)

    async def find_one_and_update(self, query, update, return_document=True):
        docs = self._get_all()
        matched_doc = None
        for doc in docs:
            if self._matches(doc, query):
                if "$set" in update:
                    for uk, uv in update["$set"].items():
                        doc[uk] = uv
                matched_doc = doc
                break
        if matched_doc is not None:
            self._save_all(docs)
        return matched_doc

    def find(self, query):
        docs = self._get_all()
        matched = [d for d in docs if self._matches(d, query)]
        return MockCursor(matched)


class MockDatabase:
    def __init__(self, file_path=DB_PATH):
        self.file_path = file_path
        self._collections = {}

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = MockCollection(name, self)
        return self._collections[name]

    def __getattr__(self, name):
        return self[name]

    def _read_data(self):
        import json
        if not os.path.exists(self.file_path):
            return {}
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_data(self, data):
        import json
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, default=str, indent=2)
        except Exception as e:
            print(f"Error writing to db.json: {e}")


_client = None
_db = MockDatabase()


async def connect_db():
    global _client, _db
    print("Always using local MockDatabase for offline-first development.")
    _client = None
    _db = MockDatabase()


async def close_db():
    pass


def get_database():
    return _db