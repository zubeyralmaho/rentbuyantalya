// @ts-nocheck
// Template helpers for storage handlers used as a reference. Not part of the build.
  // Storage upload handlers
  const handleImageUploadSuccess = (result: UploadResult) => {
    if (result.success && result.path) {
      setFormData(prev => ({
        ...prev,
        storage_paths: [...(prev.storage_paths || []), result.path!]
      }));
      setUploadError('');
    }
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
  };

  const removeStorageImage = async (index: number) => {
    const paths = formData.storage_paths || [];
    const pathToDelete = paths[index];
    
    if (pathToDelete) {
      try {
        await deleteFile(pathToDelete, 'listings');
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      storage_paths: paths.filter((_, i) => i !== index)
    }));
  };

  const getStorageImageUrl = (path: string) => {
    return getStorageUrl(path, 'listings');
  };