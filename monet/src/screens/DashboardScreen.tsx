import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import {
  ensureProfile,
  errorMessage,
  formatMoney,
  parseMoney,
  removeTransaction,
  saveGoal,
  saveTransaction,
} from "../services/financeService";
import type { Goal, Transaction } from "../services/financeService";
import { colors, shared } from "../styles/theme";
import { Button, Field, Sheet } from "../components/UI";
import type { IconName } from "../components/UI";
import { BalanceChart } from "../components/BalanceChart";

type Mode = "income" | "expense" | "goals" | "goal" | null;

export default function DashboardScreen({ user }: { user: User }) {
  const [name, setName] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [mode, setMode] = useState<Mode>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const savingRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    const subscriptions: Array<() => void> = [];
    const ready = new Set<string>();

    setLoading(true);
    setLoadError("");

    function markReady(key: string) {
      ready.add(key);
      if (ready.size === 3 && active) setLoading(false);
    }

    function fail(error: unknown) {
      if (!active) return;
      setLoadError(errorMessage(error));
      setLoading(false);
    }

    async function start() {
      try {
        await ensureProfile(user);
        if (!active) return;

        subscriptions.push(
          onSnapshot(
            doc(db, "users", user.uid),
            (snapshot) => {
              if (!active) return;
              setName(snapshot.data()?.name ?? "Usuário");
              markReady("profile");
            },
            fail
          )
        );

        subscriptions.push(
          onSnapshot(
            query(
              collection(db, "users", user.uid, "transactions"),
              orderBy("createdAt", "asc")
            ),
            (snapshot) => {
              if (!active) return;

              setTransactions(
                snapshot.docs.map(
                  (item) => ({ ...item.data(), id: item.id } as Transaction)
                )
              );

              markReady("transactions");
            },
            fail
          )
        );

        subscriptions.push(
          onSnapshot(
            query(
              collection(db, "users", user.uid, "goals"),
              orderBy("createdAt", "desc")
            ),
            (snapshot) => {
              if (!active) return;

              setGoals(
                snapshot.docs.map(
                  (item) => ({ ...item.data(), id: item.id } as Goal)
                )
              );

              markReady("goals");
            },
            fail
          )
        );
      } catch (error) {
        fail(error);
      }
    }

    void start();

    return () => {
      active = false;
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [user.uid, retry]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let balance = 0;
    const history = [0];

    for (const transaction of transactions) {
      if (transaction.type === "income") {
        income += transaction.amountCents;
        balance += transaction.amountCents;
      } else {
        expense += transaction.amountCents;
        balance -= transaction.amountCents;
      }

      history.push(balance);
    }

    return {
      income,
      expense,
      balance,
      history: history.slice(-8),
    };
  }, [transactions]);

  const recent = [...transactions].reverse();
  const visibleTransactions = showAll ? recent : recent.slice(0, 3);
  const money = (value: number) => (hidden ? "••••" : formatMoney(value));

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia," : hour < 18 ? "Boa tarde," : "Boa noite,";

  function openForm(nextMode: Mode, defaultCategory = "") {
    if (savingRef.current) return;

    setTitle("");
    setCategory(defaultCategory);
    setAmount("");
    setMode(nextMode);
  }

  function closeForm() {
    if (!savingRef.current) setMode(null);
  }

  async function save() {
    if (
      savingRef.current ||
      !mode ||
      mode === "goals"
    ) {
      return;
    }

    if (!title.trim()) {
      Alert.alert("Falta uma informação", "Preencha a descrição.");
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const cents = parseMoney(amount);

      if (mode === "goal") {
        await saveGoal(user.uid, title.trim(), cents);
      } else {
        await saveTransaction(user.uid, {
          title: title.trim(),
          category: category.trim() || "Outros",
          type: mode,
          amountCents: cents,
        });
      }

      setMode(null);
    } catch (error) {
      Alert.alert("Não foi possível salvar", errorMessage(error));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Não foi possível sair", errorMessage(error));
    }
  }

  function showProfile() {
    Alert.alert(name, user.email ?? "", [
      { text: "Fechar", style: "cancel" },
      {
        text: "Sair da conta",
        style: "destructive",
        onPress: () => void logout(),
      },
    ]);
  }

  function confirmDelete(transaction: Transaction) {
    Alert.alert(
      "Excluir lançamento?",
      `Deseja excluir "${transaction.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeTransaction(user.uid, transaction.id);
            } catch (error) {
              Alert.alert("Não foi possível excluir", errorMessage(error));
            }
          },
        },
      ]
    );
  }

  if (loading || loadError) {
    return (
      <SafeAreaView style={shared.center}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={shared.muted}>Carregando seu painel...</Text>
          </>
        ) : (
          <>
            <Text style={shared.title}>Não conseguimos carregar os dados</Text>
            <Text style={shared.muted}>{loadError}</Text>
            <Button
              title="Tentar novamente"
              onPress={() => setRetry((value) => value + 1)}
            />
            <Pressable onPress={() => void logout()}>
              <Text style={shared.link}>Sair da conta</Text>
            </Pressable>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={shared.page} edges={["top", "left", "right"]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={shared.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>{name}</Text>
          </View>

          <Pressable
            style={styles.avatar}
            onPress={showProfile}
            accessibilityLabel="Abrir perfil"
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <View style={shared.row}>
            <Text style={styles.balanceLabel}>Saldo total</Text>

            <Pressable
              onPress={() => setHidden(!hidden)}
              hitSlop={12}
              accessibilityLabel={hidden ? "Mostrar valores" : "Ocultar valores"}
            >
              <Ionicons
                name={hidden ? "eye-outline" : "eye-off-outline"}
                size={23}
                color="#B2B5AC"
              />
            </Pressable>
          </View>

          <Text
            style={styles.balance}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {money(summary.balance)}
          </Text>

          <View style={styles.totals}>
            <View style={{ flex: 1 }}>
              <Text style={styles.balanceLabel}>Receitas</Text>
              <Text style={styles.balanceDetail}>+ {money(summary.income)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.balanceLabel}>Despesas</Text>
              <Text style={styles.balanceDetail}>− {money(summary.expense)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Action
            icon="arrow-up-outline"
            label="Transferir"
            onPress={() => openForm("expense", "Transferência")}
          />
          <Action
            icon="barcode-outline"
            label="Pagar"
            onPress={() => openForm("expense", "Pagamento")}
          />
          <Action
            icon="add-circle-outline"
            label="Depositar"
            onPress={() => openForm("income", "Receita")}
          />
        </View>

        <View style={styles.cardsRow}>
          <View style={[shared.card, styles.accountCard]}>
            <View style={shared.row}>
              <Text style={styles.smallLabel}>CONTA</Text>
              <View style={styles.purpleDot} />
            </View>

            <View>
              <Text style={styles.accountTitle}>Conta principal</Text>
              <Text style={shared.muted}>Controle pessoal</Text>
            </View>
          </View>

          <View style={[shared.card, styles.chartCard]}>
            <Text style={styles.accountTitle}>Evolução</Text>

            {hidden ? (
              <View style={styles.hiddenChart}>
                <Text style={shared.muted}>Valores ocultos</Text>
              </View>
            ) : (
              <BalanceChart values={summary.history} />
            )}

            <Text style={styles.chartCaption}>Últimos lançamentos</Text>
          </View>
        </View>

        <View style={shared.row}>
          <Text style={styles.sectionTitle}>
            {showAll ? "Todas as transações" : "Transações recentes"}
          </Text>

          <Pressable onPress={() => setShowAll(!showAll)}>
            <Text style={shared.link}>{showAll ? "Recentes" : "Ver todas"}</Text>
          </Pressable>
        </View>

        <View style={[shared.card, { paddingVertical: 4 }]}>
          {visibleTransactions.length === 0 ? (
            <Text style={styles.empty}>
              Nenhuma movimentação ainda. Use os botões acima para começar.
            </Text>
          ) : (
            visibleTransactions.map((transaction, index) => {
              const isIncome = transaction.type === "income";

              return (
                <Pressable
                  key={transaction.id}
                  onLongPress={() => confirmDelete(transaction)}
                  accessibilityHint="Mantenha pressionado para excluir"
                  style={[
                    styles.transaction,
                    index < visibleTransactions.length - 1 &&
                      styles.transactionBorder,
                  ]}
                >
                  <View style={styles.transactionIcon}>
                    <Ionicons
                      name={isIncome ? "briefcase-outline" : "bag-outline"}
                      size={22}
                      color={colors.muted}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.transactionTitle}>
                      {transaction.title}
                    </Text>
                    <Text style={shared.muted}>{transaction.category}</Text>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: isIncome ? colors.green : colors.red },
                    ]}
                  >
                    {isIncome ? "+" : "−"} {money(transaction.amountCents)}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        {transactions.length > 0 && (
          <Text style={styles.hint}>
            Mantenha um lançamento pressionado para excluí-lo.
          </Text>
        )}
      </ScrollView>

      <SafeAreaView
        edges={["bottom"]}
        style={styles.footerBackground}
      >
        <View style={styles.footer}>
          <Tab
            icon="home-outline"
            label="Início"
            active={!showAll}
            onPress={() => {
              setShowAll(false);
              scrollRef.current?.scrollTo({ y: 0, animated: true });
            }}
          />
          <Tab
            icon="receipt-outline"
            label="Extrato"
            active={showAll}
            onPress={() => setShowAll(true)}
          />
          <Tab
            icon="pie-chart-outline"
            label="Planejar"
            onPress={() => openForm("goals")}
          />
          <Tab
            icon="person-outline"
            label="Perfil"
            onPress={showProfile}
          />
        </View>
      </SafeAreaView>

      <Sheet
        visible={mode !== null}
        onClose={closeForm}
        title={
          mode === "goals"
            ? "Suas metas"
            : mode === "goal"
              ? "Nova meta"
              : mode === "income"
                ? "Registrar receita"
                : "Registrar despesa"
        }
      >
        {mode === "goals" ? (
          <>
            {goals.length === 0 ? (
              <Text style={shared.muted}>Você ainda não cadastrou metas.</Text>
            ) : (
              goals.map((goal) => (
                <View key={goal.id} style={shared.card}>
                  <Text style={styles.accountTitle}>{goal.title}</Text>
                  <Text style={shared.muted}>
                    Valor desejado: {money(goal.targetCents)}
                  </Text>
                </View>
              ))
            )}

            <Button
              title="Criar meta"
              onPress={() => openForm("goal")}
            />
          </>
        ) : (
          <>
            <Text style={shared.muted}>
              {mode === "goal"
                ? "Defina o que deseja conquistar e o valor necessário."
                : "Este lançamento será salvo no seu controle financeiro."}
            </Text>

            <Field
              label={mode === "goal" ? "Nome da meta" : "Descrição"}
              placeholder={mode === "goal" ? "Comprar um notebook" : "Mercado Verde"}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              editable={!saving}
            />

            {mode !== "goal" && (
              <Field
                label="Categoria"
                placeholder="Alimentação, transporte..."
                value={category}
                onChangeText={setCategory}
                maxLength={40}
                editable={!saving}
              />
            )}

            <Field
              label="Valor em reais"
              placeholder="0,00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!saving}
            />

            <Button title="Salvar" onPress={save} busy={saving} />
          </>
        )}
      </Sheet>
    </SafeAreaView>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.action} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={27} color={colors.purple} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function Tab({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const color = active ? colors.purple : colors.muted;

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Ionicons name={icon} size={25} color={color} />
      <Text style={{ color, fontSize: 12, fontWeight: active ? "700" : "400" }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 22,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 4,
  },
  name: {
    fontSize: 27,
    fontWeight: "800",
    color: colors.text,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  avatarText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  balanceCard: {
    backgroundColor: colors.dark,
    borderRadius: 26,
    padding: 23,
    gap: 22,
  },
  balanceLabel: {
    color: "#B2B5AC",
    fontSize: 13,
  },
  balance: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  totals: {
    flexDirection: "row",
    gap: 16,
  },
  balanceDetail: {
    color: colors.white,
    fontSize: 15,
    marginTop: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  action: {
    alignItems: "center",
    gap: 9,
  },
  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.lilac,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 13,
    color: colors.text,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  accountCard: {
    flex: 0.9,
    minHeight: 140,
    justifyContent: "space-between",
    padding: 16,
  },
  chartCard: {
    flex: 1.1,
    padding: 14,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  purpleDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.purple,
  },
  accountTitle: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 5,
  },
  chartCaption: {
    fontSize: 10,
    color: colors.muted,
  },
  hiddenChart: {
    height: 85,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginRight: 8,
  },
  transaction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionIcon: {
    width: 38,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F6F6F2",
    alignItems: "center",
    justifyContent: "center",
  },
  transactionTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 12,
    maxWidth: "40%",
    textAlign: "right",
  },
  empty: {
    paddingVertical: 25,
    color: colors.muted,
    lineHeight: 22,
  },
  hint: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
  },
  footerBackground: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 13,
  },
  tab: {
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
});