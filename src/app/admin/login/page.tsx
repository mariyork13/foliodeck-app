import { loginAction } from "@/lib/actions/auth";

export default async function AdminLoginPage(props: PageProps<"/admin/login">) {
  const searchParams = await props.searchParams;
  const hasError = searchParams.error === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#161618] px-4">
      <form action={loginAction} className="w-full max-w-sm rounded-xl bg-[#212124] p-6">
        <h1 className="mb-4 text-lg font-medium text-white">Школа ДТ</h1>
        {hasError && <p className="mb-3 text-sm text-red-400">Неверный пароль.</p>}
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          autoFocus
          required
          className="mb-4 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none placeholder:text-white/40"
        />
        <button type="submit" className="w-full rounded-lg bg-white py-2 font-medium text-black hover:bg-white/90">
          Войти
        </button>
      </form>
    </div>
  );
}
