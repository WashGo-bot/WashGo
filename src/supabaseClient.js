import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase partagé par toute l'application.
 *
 * Les deux valeurs ci-dessous doivent être définies dans un fichier .env
 * (voir .env.example) à la racine du projet :
 *
 *   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
 *
 * Ces valeurs se trouvent dans votre projet Supabase, sous
 * Project Settings → API.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // On ne bloque pas le build, mais on prévient clairement en console :
  // sans ces variables, aucune donnée ne pourra être lue ni écrite.
  // eslint-disable-next-line no-console
  console.error(
    "[WashGo] Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. " +
      "Copiez .env.example vers .env et renseignez vos identifiants Supabase."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
