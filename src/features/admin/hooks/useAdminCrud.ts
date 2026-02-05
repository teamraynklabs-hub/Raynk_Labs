'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface UseAdminCrudOptions<T> {
  endpoint: string;
  entityName: string;
  onSuccess?: () => void;
  autoFetch?: boolean;
}

interface CrudState<T> {
  data: T[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  modalOpen: boolean;
  deleteDialogOpen: boolean;
  editing: T | null;
  itemToDelete: T | null;
}

export function useAdminCrud<T extends { _id: string }>({
  endpoint,
  entityName,
  onSuccess,
  autoFetch = true,
}: UseAdminCrudOptions<T>) {
  const [state, setState] = useState<CrudState<T>>({
    data: [],
    loading: true,
    saving: false,
    deleting: false,
    modalOpen: false,
    deleteDialogOpen: false,
    editing: null,
    itemToDelete: null,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      setState((s) => ({
        ...s,
        data: Array.isArray(data) ? data : [],
        loading: false,
      }));
    } catch (error) {
      toast.error(`Failed to load ${entityName}`);
      setState((s) => ({ ...s, loading: false }));
    }
  }, [endpoint, entityName]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  // Open modal for adding
  const openAdd = useCallback(() => {
    setState((s) => ({ ...s, modalOpen: true, editing: null }));
  }, []);

  // Open modal for editing
  const openEdit = useCallback((item: T) => {
    setState((s) => ({ ...s, modalOpen: true, editing: item }));
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setState((s) => ({ ...s, modalOpen: false, editing: null }));
  }, []);

  // Open delete confirmation
  const openDelete = useCallback((item: T) => {
    setState((s) => ({ ...s, deleteDialogOpen: true, itemToDelete: item }));
  }, []);

  // Close delete confirmation
  const closeDelete = useCallback(() => {
    setState((s) => ({ ...s, deleteDialogOpen: false, itemToDelete: null }));
  }, []);

  // Save (create or update)
  const save = useCallback(
    async (data: FormData | Record<string, unknown>) => {
      setState((s) => ({ ...s, saving: true }));

      try {
        const isFormData = data instanceof FormData;
        const method = state.editing ? 'PUT' : 'POST';

        const res = await fetch(endpoint, {
          method,
          ...(isFormData
            ? { body: data }
            : {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || `Failed to save ${entityName}`);
        }

        toast.success(
          state.editing
            ? `${entityName} updated successfully`
            : `${entityName} created successfully`
        );

        closeModal();
        await fetchData();
        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(`Failed to save ${entityName}`);
        }
      } finally {
        setState((s) => ({ ...s, saving: false }));
      }
    },
    [state.editing, endpoint, entityName, closeModal, fetchData, onSuccess]
  );

  // Delete
  const remove = useCallback(
    async (id?: string) => {
      const itemId = id || state.itemToDelete?._id;
      if (!itemId) return;

      setState((s) => ({ ...s, deleting: true }));

      try {
        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: itemId }),
        });

        if (!res.ok) {
          const result = await res.json();
          throw new Error(result.message || `Failed to delete ${entityName}`);
        }

        toast.success(`${entityName} deleted successfully`);
        closeDelete();
        await fetchData();
        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(`Failed to delete ${entityName}`);
        }
      } finally {
        setState((s) => ({ ...s, deleting: false }));
      }
    },
    [state.itemToDelete, endpoint, entityName, closeDelete, fetchData, onSuccess]
  );

  // Confirm delete (for use with DeleteConfirmDialog)
  const confirmDelete = useCallback(() => {
    remove();
  }, [remove]);

  return {
    // State
    data: state.data,
    loading: state.loading,
    saving: state.saving,
    deleting: state.deleting,
    modalOpen: state.modalOpen,
    deleteDialogOpen: state.deleteDialogOpen,
    editing: state.editing,
    itemToDelete: state.itemToDelete,

    // Actions
    fetchData,
    openAdd,
    openEdit,
    closeModal,
    openDelete,
    closeDelete,
    save,
    remove,
    confirmDelete,
  };
}
