import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { errorMessage } from "../services/financeService";
import { colors, shared } from "../styles/theme";
import { Button, Field } from "../components/UI";

export type LoginData = {
  email: string;
  password: string;
  name: string;
  register: boolean;
};

type Props = {
  busy: boolean;
  onSubmit: (data: LoginData) => Promise<void>;
};

export default function LoginScreen({ busy, onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [register, setRegister] = useState(false);
  const [resetting, setResetting] = useState(false);

  const locked = busy || resetting;

  function submit() {
    if (locked) return;

    if (!email.trim() || !password) {
      Alert.alert("Confira os campos", "Preencha o e-mail e a senha.");
      return;
    }

    if (register && name.trim().length < 2) {
      Alert.alert("Confira seu nome", "Informe pelo menos 2 caracteres.");
      return;
    }

    if (register && password.length < 6) {
      Alert.alert("Senha curta", "Use pelo menos 6 caracteres.");
      return;
    }

    void onSubmit({
      email: email.trim(),
      password,
      name: name.trim(),
      register,
    });
  }

  async function recoverPassword() {
    if (locked) return;

    if (!email.trim()) {
      Alert.alert("Recuperar senha", "Preencha primeiro o campo de e-mail.");
      return;
    }

    setResetting(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());

      Alert.alert(
        "Confira seu e-mail",
        "Se houver uma conta para esse endereço, você receberá as instruções."
      );
    } catch (error) {
      Alert.alert("Não foi possível enviar", errorMessage(error));
    } finally {
      setResetting(false);
    }
  }

  return (
    <SafeAreaView style={shared.page}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View>
            <View style={styles.brand}>
                <Image
                  source={require("../../assets/monet-icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                     accessibilityLabel="Capivara do Monet"
                />

              <Text style={styles.brandName}>Monet</Text>
            </View>

            <Text style={styles.headline}>
              {register ? "Seu controle\ncomeça aqui." : "Seu dinheiro, com\nclareza."}
            </Text>

            <Text style={styles.description}>
              {register
                ? "Crie sua conta e organize sua vida financeira."
                : "Entre para acompanhar sua vida financeira de um jeito simples e seguro."}
            </Text>

            {register && (
              <Field
                label="Nome"
                icon="person-outline"
                placeholder="Como você se chama?"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={80}
                editable={!locked}
              />
            )}

            <Field
              label="E-mail"
              icon="mail-outline"
              placeholder="ana@exemplo.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              editable={!locked}
            />

            <Field
              label="Senha"
              icon="lock-closed-outline"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!visiblePassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={register ? "new-password" : "current-password"}
              editable={!locked}
              onSubmitEditing={submit}
              right={
                <Pressable
                  onPress={() => setVisiblePassword(!visiblePassword)}
                  accessibilityLabel={
                    visiblePassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  hitSlop={10}
                >
                  <Ionicons
                    name={visiblePassword ? "eye-outline" : "eye-off-outline"}
                    size={23}
                    color={colors.muted}
                  />
                </Pressable>
              }
            />

            {!register && (
              <Pressable
                disabled={locked}
                onPress={recoverPassword}
                style={styles.forgot}
              >
                <Text style={shared.link}>
                  {resetting ? "Enviando..." : "Esqueci minha senha"}
                </Text>
              </Pressable>
            )}

            <Button
              title={register ? "Criar conta" : "Entrar"}
              onPress={submit}
              busy={locked}
            />

            {!register && (
              <View
                style={styles.biometric}
                accessibilityLabel="Biometria ainda não disponível"
              >
                <Ionicons
                  name="finger-print-outline"
                  size={24}
                  color={colors.purple}
                />
                <Text style={shared.muted}>Biometria · em breve</Text>
              </View>
            )}
          </View>

          <Pressable
            disabled={locked}
            onPress={() => {
              setRegister(!register);
              setPassword("");
            }}
            style={styles.switchMode}
          >
            <Text style={shared.muted}>
              {register ? "Já tem uma conta? " : "Ainda não tem conta? "}
              <Text style={shared.link}>
                {register ? "Entrar" : "Criar conta"}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 32,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 36,
  },
    logo: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: colors.text,
},
  brandName: {
    fontSize: 24,
    color: colors.text,
  },
  headline: {
    fontSize: 35,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -1,
    color: colors.text,
    marginBottom: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    marginBottom: 34,
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: 24,
    paddingVertical: 4,
  },
  biometric: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },
  switchMode: {
    alignItems: "center",
    paddingVertical: 22,
    marginTop: 40,
  },
  
});