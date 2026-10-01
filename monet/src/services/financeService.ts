import { FirebaseError } from "firebase/app";
import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  title: string;
  category: string;
  type: TransactionType;
  amountCents: number;
};

export type Goal = {
  id: string;
  title: string;
  targetCents: number;
};

export function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseMoney(text: string) {
  const normalized = text.trim().replace(/\s|R\$/g, "");

  const valid = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;

  if (!valid.test(normalized)) {
    throw new Error("Informe um valor como 150,00 ou 1.250,00.");
  }

  const [whole, decimal = ""] = normalized.replace(/\./g, "").split(",");

  const cents =
    Number(whole) * 100 + Number(decimal.padEnd(2, "0"));

  if (
    !Number.isSafeInteger(cents) ||
    cents <= 0 ||
    cents > 100000000000
  ) {
    throw new Error("Informe um valor maior que zero e dentro do limite.");
  }

  return cents;
}

export function errorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      "auth/invalid-email": "Informe um e-mail válido.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/user-not-found": "E-mail ou senha incorretos.",
      "auth/wrong-password": "E-mail ou senha incorretos.",
      "auth/email-already-in-use": "Este e-mail já está cadastrado.",
      "auth/weak-password": "Use uma senha com pelo menos 6 caracteres.",
      "auth/password-does-not-meet-requirements":
        "A senha não atende à política configurada no Firebase.",
      "auth/too-many-requests": "Muitas tentativas. Aguarde e tente novamente.",
      "auth/network-request-failed": "Verifique sua conexão com a internet.",
      "auth/operation-not-allowed":
        "Habilite o login por e-mail e senha no Firebase.",
      "permission-denied": "Acesso negado. Confira as regras do Firestore.",
      unavailable: "Serviço indisponível. Verifique sua conexão.",
    };

    return messages[error.code] ?? "Não foi possível concluir. Tente novamente.";
  }

  return error instanceof Error
    ? error.message
    : "Ocorreu um erro inesperado.";
}

export async function ensureProfile(user: User, name?: string) {
  const reference = doc(db, "users", user.uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists()) {
      transaction.set(reference, {
        name: (
          name?.trim() ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "Usuário"
        ).slice(0, 80),
        email: user.email,
        createdAt: serverTimestamp(),
      });
    }
  });
}

export async function saveTransaction(
  uid: string,
  data: Omit<Transaction, "id">
) {
  await addDoc(collection(db, "users", uid, "transactions"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function removeTransaction(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "transactions", id));
}

export async function saveGoal(
  uid: string,
  title: string,
  targetCents: number
) {
  await addDoc(collection(db, "users", uid, "goals"), {
    title,
    targetCents,
    createdAt: serverTimestamp(),
  });
}