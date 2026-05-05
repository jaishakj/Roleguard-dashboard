import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Record } from '../../types';
import { Plus, Trash2, Edit3, Save, X, Loader2, Shield, User as UserIcon } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export function DashboardShell({ title, subtitle, canCreate = true, canEdit = true, showAllRecords = false }: { 
  title: string; 
  subtitle: string;
  canCreate?: boolean;
  canEdit?: boolean;
  showAllRecords?: boolean;
}) {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    if (!user) return;

    const baseQuery = collection(db, 'records');
    const q = showAllRecords 
      ? query(baseQuery, orderBy('createdAt', 'desc'))
      : query(baseQuery, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record));
      setRecords(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'records');
    });

    return () => unsubscribe();
  }, [user, showAllRecords]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      await addDoc(collection(db, 'records'), {
        userId: user!.uid,
        title: newTitle,
        content: newContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
      toast.success("Record created");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'records');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteDoc(doc(db, 'records', id));
      toast.success("Record deleted");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `records/${id}`);
    }
  };

  const handleUpdate = async (id: string, title: string, content: string) => {
    try {
      await updateDoc(doc(db, 'records', id), {
        title,
        content,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
      toast.success("Record updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `records/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        {canCreate && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Record
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Create New Record</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Record title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea 
                value={newContent} 
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                placeholder="What's on your mind?"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">Save Record</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No records found. {canCreate && "Create your first one!"}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <RecordCard 
              key={record.id} 
              record={record} 
              canEdit={canEdit && (profile?.role === 'admin' || record.userId === user?.uid)}
              onDelete={() => handleDelete(record.id)}
              onUpdate={(t, c) => handleUpdate(record.id, t, c)}
              isEditing={editingId === record.id}
              setEditing={(v) => setEditingId(v ? record.id : null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecordCard({ record, canEdit, onDelete, onUpdate, isEditing, setEditing }: {
  record: Record;
  canEdit: boolean;
  onDelete: () => void | Promise<void>;
  onUpdate: (t: string, c: string) => void | Promise<void>;
  isEditing: boolean;
  setEditing: (v: boolean) => void;
  key?: string;
}) {
  const [editTitle, setEditTitle] = useState(record.title);
  const [editContent, setEditContent] = useState(record.content);

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-xl border-2 border-indigo-200 shadow-lg space-y-3">
        <input 
          value={editTitle} 
          onChange={e => setEditTitle(e.target.value)} 
          className="w-full font-semibold border-b border-gray-100 focus:border-indigo-300 outline-none pb-1"
        />
        <textarea 
          value={editContent} 
          onChange={e => setEditContent(e.target.value)} 
          className="w-full text-sm text-gray-600 outline-none min-h-[100px]"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => setEditing(false)} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
          <button onClick={() => onUpdate(editTitle, editContent)} className="p-1.5 text-green-600 hover:text-green-700"><Save className="w-5 h-5"/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{record.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4"/></button>}
          {canEdit && <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>}
        </div>
      </div>
      <p className="text-sm text-gray-600 flex-grow line-clamp-4 leading-relaxed mb-4">{record.content}</p>
      <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-auto pt-4 border-t border-gray-50">
        <span>{formatDate(record.createdAt)}</span>
        <div className="flex items-center gap-1">
          <UserIcon className="w-3 h-3" />
          <span className="max-w-[80px] truncate">{record.userId.substring(0, 8)}...</span>
        </div>
      </div>
    </div>
  );
}
