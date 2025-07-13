/**
 * Storage cleanup utilities for handling localStorage quota issues
 */

// 检查 localStorage 可用空间
export const checkStorageQuota = (): { used: number; available: number; total: number } => {
  let used = 0;
  let total = 0;
  
  try {
    // 计算当前使用的空间
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // 尝试估算总可用空间（通常是 5-10MB）
    const testKey = 'storage-test';
    const testChunk = 'x'.repeat(1024); // 1KB
    let testSize = 0;
    
    try {
      while (testSize < 10 * 1024 * 1024) { // 最多测试 10MB
        localStorage.setItem(testKey, testChunk.repeat(testSize / 1024 + 1));
        testSize += 1024;
      }
    } catch (e) {
      total = testSize + used;
    } finally {
      localStorage.removeItem(testKey);
    }
    
    return {
      used,
      available: total - used,
      total
    };
  } catch (error) {
    console.error('Error checking storage quota:', error);
    return { used: 0, available: 0, total: 0 };
  }
};

// 清理损坏的存储数据
export const cleanupCorruptedStorage = (): boolean => {
  try {
    const keysToClean = ['chat-store', 'settings-store'];
    
    for (const key of keysToClean) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data); // 测试是否可以解析
        }
      } catch (e) {
        console.warn(`Removing corrupted storage key: ${key}`);
        localStorage.removeItem(key);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error cleaning up storage:', error);
    return false;
  }
};

// 强制清理所有应用相关的存储
export const forceCleanStorage = (): boolean => {
  try {
    const appKeys = ['chat-store', 'settings-store'];
    
    for (const key of appKeys) {
      localStorage.removeItem(key);
    }
    
    console.log('Storage cleaned successfully');
    return true;
  } catch (error) {
    console.error('Error force cleaning storage:', error);
    return false;
  }
};

// 压缩存储数据
export const compressStorageData = (data: any): any => {
  try {
    // 移除图片数据
    if (data.sessions && Array.isArray(data.sessions)) {
      data.sessions = data.sessions.map((session: any) => ({
        ...session,
        messages: session.messages?.map((message: any) => {
          const compressed = { ...message };
          // 移除大型图片数据
          if (compressed.imageUrl && compressed.imageUrl.startsWith('data:')) {
            compressed.imageUrl = '[IMAGE_REMOVED]';
          }
          return compressed;
        }) || []
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error compressing storage data:', error);
    return data;
  }
};

// 安全的 localStorage 设置方法
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      console.warn('Storage quota exceeded, attempting cleanup...');
      
      // 尝试清理并重试
      cleanupCorruptedStorage();
      
      try {
        // 尝试压缩数据
        const parsedValue = JSON.parse(value);
        const compressedValue = JSON.stringify(compressStorageData(parsedValue));
        localStorage.setItem(key, compressedValue);
        return true;
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
        return false;
      }
    }
    
    console.error('Error setting localStorage item:', error);
    return false;
  }
};

// 获取存储使用情况的人类可读格式
export const getStorageUsageInfo = (): string => {
  const { used, available, total } = checkStorageQuota();
  
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return `Used: ${formatBytes(used)}, Available: ${formatBytes(available)}, Total: ${formatBytes(total)}`;
}; 