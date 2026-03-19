import { useState } from 'react';
import toast from 'react-hot-toast';
import { uploadToIpfs } from '../services/ipfs';

const initialState = {
  seller: '',
  arbitrator: '',
  amount: '',
  deliveryTime: '',
  metadata: ''
};

export function CreateEscrowForm({ onCreate }) {
  const [form, setForm] = useState(initialState);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const deliveryTimestamp = Math.floor(new Date(form.deliveryTime).getTime() / 1000);
      await onCreate({ ...form, deliveryTime: deliveryTimestamp });
      setForm(initialState);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ipfsHash = await uploadToIpfs(file);
      setForm((current) => ({ ...current, metadata: ipfsHash }));
      toast.success('Uploaded metadata to IPFS.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="field md:col-span-1">
        <span>Seller address</span>
        <input name="seller" placeholder="0x..." value={form.seller} onChange={handleChange} required />
      </label>
      <label className="field md:col-span-1">
        <span>Arbitrator address</span>
        <input name="arbitrator" placeholder="0x..." value={form.arbitrator} onChange={handleChange} required />
      </label>
      <label className="field">
        <span>Amount (ETH)</span>
        <input name="amount" placeholder="0.50" value={form.amount} onChange={handleChange} required />
      </label>
      <label className="field">
        <span>Delivery time</span>
        <input name="deliveryTime" type="datetime-local" value={form.deliveryTime} onChange={handleChange} required />
      </label>
      <label className="field md:col-span-2">
        <span>Metadata / IPFS hash</span>
        <input name="metadata" placeholder="bafy..." value={form.metadata} onChange={handleChange} required />
      </label>
      <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-slate-300">
          <span className="rounded-full border border-slate-700 px-4 py-2 hover:border-brand-400">{uploading ? 'Uploading…' : 'Upload file to IPFS'}</span>
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create escrow'}
        </button>
      </div>
    </form>
  );
}
