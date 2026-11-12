import { ArrowLeft, LogIn, MapPinned } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { DEMO_ADMIN, isSupabaseMode } from '@/lib/data';

export default function LoginPage() {
  const { email: sessionEmail, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && sessionEmail) return <Navigate to="/admin" replace />;

  const submit = async (mail: string, pass: string) => {
    setBusy(true);
    setError(null);
    try {
      await signIn(mail, pass);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    void submit(email, password);
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#E3ECD9] p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
            <MapPinned className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">NeoMap Admin</h1>
            <p className="text-xs text-slate-500">UMNG · Sede Calle 100</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="admin@unimilitar.edu.co"
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            <LogIn className="h-4 w-4" aria-hidden />
            {busy ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>
        </form>

        {!isSupabaseMode && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">
              Modo demo local: los datos se guardan solo en este navegador.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              disabled={busy}
              onClick={() => {
                setEmail(DEMO_ADMIN.email);
                setPassword(DEMO_ADMIN.password);
                void submit(DEMO_ADMIN.email, DEMO_ADMIN.password);
              }}
            >
              Entrar con credenciales demo
            </Button>
          </div>
        )}

        <Link to="/" className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Ver Mapa Público
        </Link>
      </div>
    </main>
  );
}
