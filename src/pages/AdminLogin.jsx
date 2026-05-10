import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VALID_USER = "KLREMOTA";
const VALID_PASS = "KLREMOTA";
const ACCESS_TOKEN = "78TGYHBFNI76YTDGBU7FG56";
const TOKEN_EXPIRY_DAYS = 6;

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === VALID_USER && password === VALID_PASS) {
      const expiry = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem("admin_token", ACCESS_TOKEN);
      localStorage.setItem("admin_token_expiry", expiry.toString());
      navigate("/admin");
    } else {
      setError("Usuário ou senha incorretos.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Jadlog — Acesso restrito</p>
        </div>

        {/* Card */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Usuário</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <Label>Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 pr-10"
                  type={showPass ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Acesso exclusivo para administradores
        </p>
      </div>
    </div>
  );
}