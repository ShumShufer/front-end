import { type FormEvent, useEffect, useState } from 'react';
import { BadgeCheck, Building2, Mail, Pencil, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/Button/Button.tsx';
import { Input } from '../../../components/Form/Input.tsx';
import { useAuth } from '../../../context/auth/useAuth.ts';
import { useUser } from '../../../context/user/useUser.ts';
import { Role } from '../../../types/common.types.ts';
import styles from './ProfilePage.module.css';

const roleLabel: Record<Role, string> = { STUDENT: 'Student driver', MENTOR: 'Driving mentor', EDUCATION_HEAD: 'Education head', ADMIN: 'School administrator', SUPER_ADMIN: 'Platform administrator' };

export function ProfilePage() {
  const { user } = useAuth(); const { updateUser, isLoading } = useUser();
  const [editing, setEditing] = useState(false); const [firstName, setFirstName] = useState(''); const [lastName, setLastName] = useState(''); const [phone, setPhone] = useState(''); const [message, setMessage] = useState('');
  useEffect(() => { if (user) { setFirstName(user.firstName); setLastName(user.lastName); setPhone(user.phone || ''); } }, [user]);
  if (!user) return null;
  const submit = async (event: FormEvent) => { event.preventDefault(); await updateUser(user.id, { firstName, lastName, phone: phone || null }); setMessage('Profile updated.'); setEditing(false); };
  return <main className={styles.page}><div className={styles.inner}>
    <section className={styles.header}><div className={styles.avatar}>{`${user.firstName[0]}${user.lastName[0]}`}</div><div><p className={styles.kicker}>My profile</p><h1>{user.firstName} {user.lastName}</h1><p>{roleLabel[user.role]}</p></div><Button variant="secondary" onClick={() => setEditing((value) => !value)}><Pencil size={16} /> {editing ? 'Cancel' : 'Edit profile'}</Button></section>
    <div className={styles.grid}><form className={styles.card} onSubmit={submit}><div className={styles.cardHead}><h2>Personal details</h2>{message && <span className={styles.success}>{message}</span>}</div><div className={styles.fields}><Input label="First name" value={firstName} disabled={!editing} onChange={(event) => setFirstName(event.target.value)} /><Input label="Last name" value={lastName} disabled={!editing} onChange={(event) => setLastName(event.target.value)} /><Input label="Phone number" type="tel" value={phone} disabled={!editing} onChange={(event) => setPhone(event.target.value)} /><Input label="Email address" type="email" value={user.email} disabled icon={<Mail size={17} />} /></div>{editing && <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save changes'}</Button>}</form>
    <aside className={styles.stack}><section className={styles.card}><h2>Account status</h2><div className={styles.status}><BadgeCheck size={20} /><div><strong>Identity verified</strong><span>Your Fayda check is complete.</span></div></div><div className={styles.status}><ShieldCheck size={20} /><div><strong>{roleLabel[user.role]}</strong><span>Your access is scoped to your role.</span></div></div>{user.schoolId && <div className={styles.status}><Building2 size={20} /><div><strong>School workspace</strong><span>Connected to your assigned school.</span></div></div>}</section></aside></div>
  </div></main>;
}
