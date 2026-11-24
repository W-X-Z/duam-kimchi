import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center font-serif text-2xl font-bold">관리자</h1>
        <LoginForm />
      </div>
    </main>
  );
}
