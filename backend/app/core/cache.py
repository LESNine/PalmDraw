import threading
from collections import OrderedDict


class LRUCache:
    def __init__(self, max_size_mb: int = 2048):
        self._cache: OrderedDict[str, tuple] = OrderedDict()
        self._max_size = max_size_mb * 1024 * 1024
        self._current_size = 0
        self._lock = threading.Lock()

    def get(self, key: str):
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
                return self._cache[key]
            return None

    def put(self, key: str, value: tuple):
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
                return
            size = value[1]
            while self._current_size + size > self._max_size and self._cache:
                _, (_, evicted_size) = self._cache.popitem(last=False)
                self._current_size -= evicted_size
            self._cache[key] = value
            self._current_size += size

    def clear(self):
        with self._lock:
            self._cache.clear()
            self._current_size = 0

    def invalidate(self, key: str):
        with self._lock:
            if key in self._cache:
                _, size = self._cache.pop(key)
                self._current_size -= size


cache = LRUCache()
