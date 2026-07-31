import { supabase } from "./supabaseClient.js";

/**
 * Couche d'accès aux données de WashGo.
 *
 * Remplace l'ancien système `window.storage` (propre aux artefacts Claude,
 * ou simulé par storagePolyfill.js en local) par une vraie base de données
 * partagée Supabase (PostgreSQL). Toutes les fonctions ci-dessous sont
 * utilisées par App.jsx.
 *
 * Voir README.md pour le script SQL de création des tables.
 */

const CONFIG_ROW_ID = 1;

/* ---------------------------- Réglages (config) ---------------------------- */

export async function fetchConfig() {
  const { data, error } = await supabase
    .from("config")
    .select("prices, wa_number, trust_count, admin_pin")
    .eq("id", CONFIG_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    prices: data.prices || {},
    waNumber: data.wa_number || "",
    trustCount: data.trust_count ?? 500,
    adminPin: data.admin_pin || "Platini10@",
  };
}

export async function saveConfig({ prices, waNumber, trustCount, adminPin }) {
  const { error } = await supabase.from("config").upsert({
    id: CONFIG_ROW_ID,
    prices,
    wa_number: waNumber,
    trust_count: trustCount,
    admin_pin: adminPin,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/* ---------------------------- Créneaux réservés ---------------------------- */

export async function fetchBookedSlots(dateISO) {
  const { data, error } = await supabase
    .from("booked_slots")
    .select("slot")
    .eq("date", dateISO);
  if (error) throw error;
  return (data || []).map((row) => row.slot);
}

/**
 * Bascule l'état d'un créneau (réservé <-> libre) pour une date donnée.
 * Retourne la nouvelle liste des créneaux réservés pour cette date.
 */
export async function toggleSlot(dateISO, slot, isCurrentlyBooked) {
  if (isCurrentlyBooked) {
    const { error } = await supabase
      .from("booked_slots")
      .delete()
      .eq("date", dateISO)
      .eq("slot", slot);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("booked_slots")
      .insert({ date: dateISO, slot });
    if (error) throw error;
  }
  return fetchBookedSlots(dateISO);
}

/* ---------------------------- Réservations ---------------------------- */

export async function addReservation(booking, total, acompte) {
  const { error } = await supabase.from("reservations").insert({
    phone: booking.phone,
    addr_type: booking.addrType,
    city_res: booking.cityRes,
    unit_number: booking.unitNumber,
    gps: booking.gps,
    vehicle: booking.vehicle,
    date: booking.date,
    time: booking.time,
    services: booking.services,
    total,
    acompte,
  });
  if (error) throw error;
}

/* ---------------------------- Abonnements ---------------------------- */

export async function addSubscription(sub, total) {
  const { error } = await supabase.from("subscriptions").insert({
    phone: sub.phone,
    addr_type: sub.addrType,
    city_res: sub.cityRes,
    unit_number: sub.unitNumber,
    plan: sub.plan,
    passages: sub.passages,
    total,
  });
  if (error) throw error;
}
