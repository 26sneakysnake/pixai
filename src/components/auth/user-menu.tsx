/**
 * User Menu Component
 * Displays user avatar and dropdown with account options
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { User, LogOut, CreditCard, Settings } from "lucide-react";
import type { User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js";

export function UserMenu() {
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = getSupabaseBrowserClient();

        // Get initial user
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        fetchUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, session: Session | null) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    if (loading) {
        return (
            <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
        );
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/login")}
                    className="text-slate-300 hover:text-slate-100"
                >
                    Connexion
                </Button>
                <Button
                    size="sm"
                    onClick={() => router.push("/signup")}
                    className="bg-indigo-600 hover:bg-indigo-500"
                >
                    S&apos;inscrire
                </Button>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-slate-300 hover:text-slate-100"
                >
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="hidden sm:inline text-sm">
                        {user.email?.split("@")[0]}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-slate-200">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                    onClick={() => router.push("/pricing")}
                    className="text-slate-300 focus:text-slate-100 focus:bg-white/5"
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Abonnement
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="text-slate-300 focus:text-slate-100 focus:bg-white/5"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
