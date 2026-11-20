'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiSave, FiLoader, FiPlus, FiTrash2, FiSmartphone, FiEye, FiEyeOff, FiInfo, FiRotateCcw } from 'react-icons/fi';
import { LuLandmark } from 'react-icons/lu';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/components/Shared/Toast';
import { MOBILE_METHODS, ACCOUNT_TYPES, buildPaymentInfo } from '@/lib/paymentNumbers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const authHdr = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` });

const emptyBank = () => ({ bankName: '', accountName: '', accountNumber: '', branch: '', routingNumber: '', enabled: true });

// Normalise whatever is stored into a full editable form
const toForm = (raw = {}) => ({
  mobile: Object.fromEntries(MOBILE_METHODS.map((m) => {
    const v = raw.mobile?.[m.key] || {};
    return [m.key, { number: v.number || '', accountType: v.accountType || 'Personal', enabled: !!v.enabled }];
  })),
  banks: Array.isArray(raw.banks) ? raw.banks.map((b) => ({ ...emptyBank(), ...b })) : [],
  note: raw.note || '',
});

// On/off switch
const Toggle = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
    className={`inline-flex min-w-[170px] items-center gap-2 rounded-md border px-2.5 py-2 text-xs font-semibold transition ${on ? 'border-emerald-200 bg-emerald-50 text-[#027a1e]' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
    <span className={`relative inline-block h-4 w-7 rounded-full transition ${on ? 'bg-[#027a1e]' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${on ? 'left-3.5' : 'left-0.5'}`} />
    </span>
    {on ? <FiEye size={12} /> : <FiEyeOff size={12} />} {label ?? (on ? 'Shown at checkout' : 'Hidden')}
  </button>
);

const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0142b2] focus:ring-2 focus:ring-[#0142b2]/10';
const labelCls = 'mb-1 block text-xs font-semibold text-slate-500';

export default function PaymentInfoPage() {
  const { settings, refreshSettings } = useSettings() || {};
  const { showToast, toastNode } = useToast();
  const [form, setForm] = useState(() => toForm());
  const [savedJson, setSavedJson] = useState(JSON.stringify(toForm()));
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load the stored payment info once settings arrive
  useEffect(() => {
    if (!settings || loaded) return;
    const f = toForm(settings.paymentInfo || {});
    setForm(f);
    setSavedJson(JSON.stringify(f));
    setLoaded(true);
  }, [settings, loaded]);

  const dirty = JSON.stringify(form) !== savedJson;
  const preview = useMemo(() => buildPaymentInfo(form), [form]);

  const setMobile = (key, patch) => setForm((f) => ({ ...f, mobile: { ...f.mobile, [key]: { ...f.mobile[key], ...patch } } }));
  const setBank = (i, patch) => setForm((f) => ({ ...f, banks: f.banks.map((b, j) => (j === i ? { ...b, ...patch } : b)) }));

  const save = async () => {
    // A switched-on account must have its number
    const missing = [
      ...MOBILE_METHODS.filter((m) => form.mobile[m.key].enabled && !form.mobile[m.key].number.trim()).map((m) => m.name),
      ...form.banks.filter((b) => b.enabled && !b.accountNumber.trim()).map((b, i) => b.bankName || `Bank ${i + 1}`),
    ];
    if (missing.length) {
      showToast('error', `Add the number for: ${missing.join(', ')} (or switch it off)`);
      return;
    }
    setSaving(true);
    try {
      const paymentInfo = {
        mobile: Object.fromEntries(MOBILE_METHODS.map((m) => [m.key, { ...form.mobile[m.key], number: form.mobile[m.key].number.trim() }])),
        banks: form.banks.filter((b) => b.bankName.trim() || b.accountNumber.trim()).map((b) => ({
          ...b, bankName: b.bankName.trim(), accountName: b.accountName.trim(), accountNumber: b.accountNumber.trim(),
          branch: b.branch.trim(), routingNumber: b.routingNumber.trim(),
        })),
        note: form.note.trim(),
      };
      const res = await fetch(`${API_URL}/api/settings`, { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ paymentInfo }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || 'Could not save');
      const f = toForm(paymentInfo);
      setForm(f);
      setSavedJson(JSON.stringify(f));
      await refreshSettings?.();
      showToast('success', 'Payment info saved — checkout updated');
    } catch (err) {
      showToast('error', err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1b4a] outfit">Payment Info</h1>
          <p className="mt-1 text-sm text-slate-500">
            Numbers and bank accounts students send money to. Only the ones switched <b>ON</b> are shown at the course and book checkout.
            Paid orders then wait in <Link href="/dashboard/admin/orders" className="font-medium text-[#0142b2] hover:underline">Orders</Link> until you check the payment and approve.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={!dirty || saving} onClick={() => setForm(JSON.parse(savedJson))}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40">
            <FiRotateCcw size={14} /> Undo
          </button>
          <button type="button" disabled={!dirty || saving} onClick={save}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0142b2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#01368f] disabled:opacity-50">
            {saving ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />} Save
          </button>
        </div>
      </div>

      {/* What checkout shows right now (from this form) */}
      <div className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${preview.hasAny ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        <FiInfo className="mt-0.5 shrink-0" />
        {preview.hasAny
          ? <span>Checkout will show: <b>{[...preview.mobile.map((m) => m.name), ...preview.banks.map((b) => b.bankName || 'Bank')].join(', ')}</b>{dirty ? ' (after you save)' : ''}.</span>
          : <span>Nothing is switched on — checkout asks students to call <b>01323878569</b> for the payment number.</span>}
      </div>

      {/* Mobile banking */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
          <FiSmartphone className="text-[#0142b2]" />
          <h2 className="text-base font-bold text-[#0b1b4a] outfit">Mobile banking</h2>
          <span className="text-xs text-slate-400">Students use “Send Money” (or “Payment” for merchant numbers)</span>
        </div>
        <div className="divide-y divide-slate-100">
          {MOBILE_METHODS.map((m) => {
            const v = form.mobile[m.key];
            return (
              <div key={m.key} className="grid items-end gap-3 px-5 py-4 md:grid-cols-[150px_1fr_160px_170px]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white">
                    {m.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={m.logo} alt={m.name} className="h-7 w-7 object-contain" />
                      : <span className="text-[11px] font-bold" style={{ color: m.color }}>{m.name}</span>}
                  </span>
                  <span className="font-semibold text-slate-800">{m.name}</span>
                </div>
                <div>
                  <label className={labelCls}>{m.name} number</label>
                  <input className={`${inputCls} font-mono`} placeholder="01XXXXXXXXX" inputMode="tel" value={v.number}
                    onChange={(e) => setMobile(m.key, { number: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Account type</label>
                  <select className={inputCls} value={v.accountType} onChange={(e) => setMobile(m.key, { accountType: e.target.value })}>
                    {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <Toggle on={v.enabled} onChange={(on) => setMobile(m.key, { enabled: on })} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Bank accounts */}
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3">
          <LuLandmark className="text-[#0142b2]" />
          <h2 className="text-base font-bold text-[#0b1b4a] outfit">Bank accounts</h2>
          <button type="button" onClick={() => setForm((f) => ({ ...f, banks: [...f.banks, emptyBank()] }))}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-[#0142b2] hover:bg-[#eef3fc]">
            <FiPlus size={14} /> Add bank account
          </button>
        </div>
        {form.banks.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No bank account added. Click “Add bank account” to accept bank transfers.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {form.banks.map((b, i) => (
              <div key={i} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">Bank account {i + 1}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Toggle on={b.enabled} onChange={(on) => setBank(i, { enabled: on })} />
                    <button type="button" title="Remove" onClick={() => setForm((f) => ({ ...f, banks: f.banks.filter((_, j) => j !== i) }))}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-[#e5251f]">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div><label className={labelCls}>Bank name</label><input className={inputCls} placeholder="e.g. Dutch-Bangla Bank" value={b.bankName} onChange={(e) => setBank(i, { bankName: e.target.value })} /></div>
                  <div><label className={labelCls}>Account name</label><input className={inputCls} placeholder="e.g. BraveTalk Bangladesh" value={b.accountName} onChange={(e) => setBank(i, { accountName: e.target.value })} /></div>
                  <div><label className={labelCls}>Account number</label><input className={`${inputCls} font-mono`} value={b.accountNumber} onChange={(e) => setBank(i, { accountNumber: e.target.value })} /></div>
                  <div><label className={labelCls}>Branch</label><input className={inputCls} placeholder="e.g. Badda" value={b.branch} onChange={(e) => setBank(i, { branch: e.target.value })} /></div>
                  <div><label className={labelCls}>Routing number (optional)</label><input className={`${inputCls} font-mono`} value={b.routingNumber} onChange={(e) => setBank(i, { routingNumber: e.target.value })} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Note */}
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-1 block text-base font-bold text-[#0b1b4a] outfit">Note for students (optional)</label>
        <p className="mb-2 text-xs text-slate-500">Shown under the accounts at checkout, e.g. “Write your phone number in the reference”.</p>
        <textarea rows={3} className={inputCls} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
      </section>

      {/* Sticky save bar when there are unsaved changes */}
      {dirty && (
        <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-2.5 shadow-lg lg:left-[calc(50%+125px)]">
          <span className="text-sm text-slate-600">You have unsaved changes</span>
          <button type="button" onClick={save} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0142b2] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#01368f] disabled:opacity-50">
            {saving ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />} Save
          </button>
        </div>
      )}
      {toastNode}
    </div>
  );
}
