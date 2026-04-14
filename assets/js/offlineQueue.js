const OfflineQueue = (() => {
  const QUEUE_KEY = 'offlineAttendanceQueue';

  function getQueue() {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveQueue(queue) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  }

  function enqueue(entry) {
    const queue = getQueue();
    const isDuplicate = queue.some(
      (item) => item.qrValue === entry.qrValue && item.date === entry.date
    );
    if (isDuplicate) return false;
    queue.push(entry);
    saveQueue(queue);
    return true;
  }

  function dequeue(id) {
    const queue = getQueue().filter((item) => item.id !== id);
    saveQueue(queue);
  }

  function count() {
    return getQueue().length;
  }

  function clear() {
    saveQueue([]);
  }

  return { getQueue, enqueue, dequeue, count, clear };
})();
