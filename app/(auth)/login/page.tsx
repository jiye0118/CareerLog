"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthFormState } from "./actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [loginState, loginAction, isLoginPending] = useActionState<
    AuthFormState,
    FormData
  >(signIn, undefined);

  const [signupState, signupAction, isSignupPending] = useActionState<
    AuthFormState,
    FormData
  >(signUp, undefined);

  const isLogin = mode === "login";
  const state = isLogin ? loginState : signupState;
  const action = isLogin ? loginAction : signupAction;
  const isPending = isLogin ? isLoginPending : isSignupPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">CareerLog</h1>
        <p className="text-sm text-zinc-400 mb-8">커리어 기록을 시작하세요</p>

        <div className="flex gap-1 mb-6 bg-zinc-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              isLogin
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              !isLogin
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            회원가입
          </button>
        </div>

        {state?.success ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
            {state.message}
          </p>
        ) : (
          <form action={action} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 mb-1.5"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
              {state?.errors?.email && (
                <p className="mt-1 text-xs text-red-500">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 mb-1.5"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
              {state?.errors?.password && (
                <p className="mt-1 text-xs text-red-500">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {state?.message && !state.success && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isPending ? "처리 중..." : isLogin ? "로그인" : "가입하기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
