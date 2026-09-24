import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
const API_URL = "http://localhost:2500";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation, route }: any) {
    const user = route.params.user;
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/tickets`)
            .then(response => response.json())
            .then(data => {
                setTickets(data);
            })
            .catch(error => {
                console.error("Napaka:", error);
            });
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <Text style={styles.title}>IT Helpdesk</Text>

            <View style={styles.actionsRow}>
                <Pressable
                    style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
                    onPress={() => navigation.navigate("CreateTicket", {user:user})}
                >
                    <Text style={styles.btnText}>+ Nov ticket</Text>
                </Pressable>

                {user.vloga === "Administrator" && (
                    <Pressable
                        style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.8 }]}
                        onPress={() => navigation.navigate("Oprema", { user: user })}
                    >
                        <Text style={styles.btnGhostText}>Oprema</Text>
                    </Pressable>
                )}
            </View>

            <Text style={styles.sectionLabel}>Ticketi</Text>

            {tickets
                .filter(ticket =>
                    user.vloga === "Administrator" ||
                    ticket.prijavitelj === `${user.ime} ${user.priimek}`
                )
                .map(ticket => (
                    <Pressable
                        key={ticket.id}
                        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                        onPress={() => navigation.navigate("Ticket", {
                            id: ticket.id,
                            user: user
                        })}
                    >
                        <Text style={styles.cardTitle}>
                            {ticket.naslov}
                        </Text>
                        <View style={styles.badgeRow}>
                            <View style={[styles.badge, statusBadgeStyle(ticket.status)]}>
                                <Text style={[styles.badgeText, statusTextStyle(ticket.status)]}>{ticket.status}</Text>
                            </View>
                            <View style={[styles.badge, priorityBadgeStyle(ticket.prioriteta)]}>
                                <Text style={[styles.badgeText, priorityTextStyle(ticket.prioriteta)]}>{ticket.prioriteta}</Text>
                            </View>
                        </View>
                    </Pressable>
                ))}

            {tickets.length === 0 && (
                <Text style={styles.emptyText}>Trenutno ni ticketov.</Text>
            )}
        </ScrollView>
    );
}

function OpremaScreen({ navigation, route }: any) {
    const user = route.params.user;
    const [oprema, setOprema] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/oprema`)
            .then(response => response.json())
            .then(data => {
                setOprema(data);
            })
            .catch(error => {
                console.error("Napaka:", error);
            });
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <Text style={styles.title}>Oprema</Text>

            <View style={styles.actionsRow}>
                <Pressable
                    style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
                    onPress={() => navigation.navigate("createOprema", {user:user})}
                >
                    <Text style={styles.btnText}>+ Nova oprema</Text>
                </Pressable>
            </View>

            {oprema.map(oprema => (
                <View key={oprema.id} style={styles.card}>
                    <Pressable
                        style={styles.opremaInfo}
                        onPress={() => navigation.navigate("Oprema", {
                            id: oprema.id,
                            user: user
                        })}
                    >
                        <Text style={styles.cardTitle}>
                            {oprema.naziv}
                        </Text>

                        <Text style={styles.metaText}>Tip: {oprema.tip}</Text>
                        <Text style={styles.metaText}>Serijska st.: {oprema.serijska_stevilka}</Text>
                        <Text style={styles.metaText}>Lokacija: {oprema.lokacija}</Text>
                        <View style={styles.badgeRow}>
                            <View style={[styles.badge, statusBadgeStyle(oprema.status)]}>
                                <Text style={[styles.badgeText, statusTextStyle(oprema.status)]}>{oprema.status}</Text>
                            </View>
                        </View>
                    </Pressable>

                    <View style={styles.opremaButtons}>
                        <Pressable
                            style={styles.iconButton}
                            onPress={() => navigation.navigate("PatchOprema", {
                                id: oprema.id,
                                user: user
                            })}
                        >
                            <Text style={styles.iconButtonText}>Uredi</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.iconButton, styles.iconButtonDanger]}
                            onPress={async () => {
                                try {
                                    const response = await fetch(
                                        `${API_URL}/oprema/${oprema.id}`,
                                        {
                                            method: "DELETE"
                                        }
                                    );

                                    console.log("Status:", response.status);

                                    const data = await response.json();

                                    if (!response.ok) {
                                        console.error("Napaka:", data);
                                        return;
                                    }

                                    console.log("Oprema izbrisana:", data);

                                    navigation.navigate("Home", {
                                        user: user
                                    });

                                } catch (error) {
                                    console.error("Napaka pri brisanju:", error);
                                }
                            }}
                        >
                            <Text style={styles.iconButtonDangerText}>Izbrisi</Text>
                        </Pressable>
                    </View>
                </View>
            ))}

            {oprema.length === 0 && (
                <Text style={styles.emptyText}>Ni evidentirane opreme.</Text>
            )}
        </ScrollView>
    );
}
function TicketScreen({ navigation, route }: any) {
    const { id, user } = route.params;
    const [ticket, setTicket] = useState<any>(null);
    useEffect(() => {
        fetch(`${API_URL}/tickets/${id}`)
            .then(response => response.json())
            .then(data => {
                setTicket(data[0]);
            })
            .catch(error => {
                console.error("Napaka:", error);
            });
    }, [id]);
    if (!ticket) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>Nalaganje...</Text>
            </View>
        );
    }
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <Text style={styles.title}>{ticket.naslov}</Text>

            <View style={styles.detailCard}>
                <View style={styles.badgeRow}>
                    <View style={[styles.badge, statusBadgeStyle(ticket.status)]}>
                        <Text style={[styles.badgeText, statusTextStyle(ticket.status)]}>{ticket.status}</Text>
                    </View>
                    <View style={[styles.badge, priorityBadgeStyle(ticket.prioriteta)]}>
                        <Text style={[styles.badgeText, priorityTextStyle(ticket.prioriteta)]}>{ticket.prioriteta}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Opis</Text>
                    <Text style={styles.detailValue}>{ticket.opis}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Lokacija</Text>
                    <Text style={styles.detailValue}>{ticket.lokacija}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Prijavitelj</Text>
                    <Text style={styles.detailValue}>{ticket.prijavitelj}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Datum</Text>
                    <Text style={styles.detailValue}>{ticket.datum}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Resitev</Text>
                    <Text style={styles.detailValue}>{ticket.resitev || "Se ni reseno"}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Oprema ID</Text>
                    <Text style={styles.detailValue}>{ticket.oprema_id || "Ni dolocenaa"}</Text>
                </View>
            </View>

            {user.vloga === "Administrator" && (
                <View style={styles.actionsRow}>
                    <Pressable
                        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
                        onPress={() => navigation.navigate("PatchTicket", {
                            id: ticket.id,
                            user: user
                        })}
                    >
                        <Text style={styles.btnText}>Uredi ticket</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.btnDanger, pressed && { opacity: 0.8 }]}
                        onPress={async () => {
                            try {
                                const response = await fetch(
                                    `${API_URL}/tickets/${ticket.id}`,
                                    {
                                        method: "DELETE"
                                    }
                                );

                                const data = await response.json();

                                if (!response.ok) {
                                    console.error("Napaka:", data);
                                    return;
                                }

                                console.log("Ticket izbrisan:", data);

                                navigation.navigate("Home", {
                                    user: user
                                });

                            } catch (error) {
                                console.error("Napaka pri brisanju:", error);
                            }
                        }}
                    >
                        <Text style={styles.btnDangerText}>Izbriši ticket</Text>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );
}

function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const login = async () => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email
                })
            });
            const data = await response.json();
            if (!response.ok) {
                console.error("Napaka:", data);
                return;
            }

            console.log("Prijava uspešna:", data);

            navigation.navigate("Home", {
                user: data
            });
        } catch (error) {
            console.error("Napaka pri prijavi:", error);
        }
    };

    return (
        <View style={styles.loginContainer}>
            <View style={styles.loginCard}>
                <Text style={styles.title}>IT Helpdesk</Text>
                <Text style={styles.subtleText}>Prijavi se s svojim emailom</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Vnesi email"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                />

                <Pressable
                    style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
                    onPress={login}
                >
                    <Text style={styles.btnText}>Prijava</Text>
                </Pressable>
            </View>
        </View>
    );
}

function CreateTicketScreen({ navigation, route }: any) {
    const {user} = route.params;
    const [naslov, setNaslov] = useState("");
    const [opis, setOpis] = useState("");
    const [lokacija, setLokacija] = useState("");
    const [prioriteta, setPrioriteta] = useState("");

    const submitTicket = async () => {
        try {
            const response = await fetch(`${API_URL}/tickets`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        naslov: naslov,
                        opis: opis,
                        lokacija: lokacija,
                        prioriteta: prioriteta,
                        status: "Odprt",
                        prijavitelj: `${user.ime} ${user.priimek}`,
                        datum: new Date().toISOString().split("T")[0],
                        resitev: null,
                        oprema_id: null,
                    }),
                });
            const data = await response.json();

            if (!response.ok) {
                console.error("Napaka:", data);
                return;
            }

            console.log("Ticket ustvarjen:", data);

            navigation.navigate("Home", {
                user:user
            });
        } catch (error) {
            console.error("Napaka pri pošiljanju:", error);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <Text style={styles.title}>Nov ticket</Text>

            <View style={styles.formCard}>
                <Text style={styles.label}>Naslov</Text>
                <TextInput
                    style={styles.input}
                    value={naslov}
                    onChangeText={setNaslov}
                    placeholder="Vnesi naslov"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Opis</Text>
                <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={opis}
                    onChangeText={setOpis}
                    placeholder="Opiši problem"
                    placeholderTextColor="#9CA3AF"
                    multiline
                />

                <Text style={styles.label}>Lokacija</Text>
                <TextInput
                    style={styles.input}
                    value={lokacija}
                    onChangeText={setLokacija}
                    placeholder="Vnesi lokacijo"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Prioriteta</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        style={styles.picker}
                        selectedValue={prioriteta}
                        onValueChange={(itemValue) => setPrioriteta(itemValue)}
                    >
                        <Picker.Item label="Izberi prioriteto" value="" />
                        <Picker.Item label="Nizka" value="Nizka" />
                        <Picker.Item label="Srednja" value="Srednja" />
                        <Picker.Item label="Visoka" value="Visoka" />
                    </Picker>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
                    onPress={submitTicket}
                >
                    <Text style={styles.btnText}>Ustvari ticket</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

function CreateOpremaScreen({ navigation, route }: any) {
    const { user } = route.params;
    const [naziv, setNaziv] = useState("");
    const [tip, setTip] = useState("");
    const [serijska_stevilka, setserijska] = useState("");
    const [lokacija, setLokacija] = useState("");
    const [status, setStatus] = useState("");

    const createOprema = async () => {
        try {
            const response = await fetch(`${API_URL}/oprema`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        naziv: naziv,
                        tip: tip,
                        serijska_stevilka: serijska_stevilka,
                        lokacija: lokacija,
                        status: status
                    }),
                });
            const data = await response.json();

            if (!response.ok) {
                console.error("Napaka:", data);
                return;
            }

            console.log("Oprema ustvarjena:", data);

            navigation.navigate("Home", {
                user:user
            });
        } catch (error) {
            console.error("Napaka pri pošiljanju:", error);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <Text style={styles.title}>Nova oprema</Text>

            <View style={styles.formCard}>
                <Text style={styles.label}>Naziv</Text>
                <TextInput
                    style={styles.input}
                    value={naziv}
                    onChangeText={setNaziv}
                    placeholder="Vnesi naziv"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Tip</Text>
                <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={tip}
                    onChangeText={setTip}
                    placeholder="Tip opreme"
                    placeholderTextColor="#9CA3AF"
                    multiline
                />

                <Text style={styles.label}>Serijska stevilka</Text>
                <TextInput
                    style={styles.input}
                    value={serijska_stevilka}
                    onChangeText={setserijska}
                    placeholder="Vnesi serijsko stevilko"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Lokacija</Text>
                <TextInput
                    style={styles.input}
                    value={lokacija}
                    onChangeText={setLokacija}
                    placeholder="Vnesi lokacijo"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        style={styles.picker}
                        selectedValue={status}
                        onValueChange={(itemValue) => setStatus(itemValue)}
                    >
                        <Picker.Item label="Izberi status" value="" />
                        <Picker.Item label="Deluje" value="Deluje" />
                        <Picker.Item label="V opravilu" value="V opravilu" />
                    </Picker>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
                    onPress={createOprema}
                >
                    <Text style={styles.btnText}>Ustvari opremo</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}
function PatchTicketScreen({ navigation, route }: any) {
    const { id, user } = route.params;
    const [naslov, setNaslov] = useState("");
    const [opis, setOpis] = useState("");
    const [lokacija, setLokacija] = useState("");
    const [prioriteta, setPrioriteta] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/tickets/${id}`)
            .then(response => response.json())
            .then(data => {
                const ticket = data[0];

                setNaslov(ticket.naslov);
                setOpis(ticket.opis);
                setLokacija(ticket.lokacija);
                setPrioriteta(ticket.prioriteta);
            })
            .catch(error => {
                console.error("Napaka:", error);
            });
    }, [id]);
    const submitTicket = async () => {
        try {
            const response = await fetch(`${API_URL}/tickets/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        naslov: naslov,
                        opis: opis,
                        lokacija: lokacija,
                        prioriteta: prioriteta,
                        status: "Odprt",
                        prijavitelj: `${user.ime} ${user.priimek}`,
                        datum: new Date().toISOString().split("T")[0],
                        resitev: null,
                        oprema_id: null,
                    }),
                });
            const data = await response.json();

            if (!response.ok) {
                console.error("Napaka:", data);
                return;
            }

            console.log("Ticket ustvarjen:", data);

            navigation.navigate("Home", {user:user});
        } catch (error) {
            console.error("Napaka pri pošiljanju:", error);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <Text style={styles.title}>Spremeni ticket</Text>

            <View style={styles.formCard}>
                <Text style={styles.label}>Naslov</Text>
                <TextInput
                    style={styles.input}
                    value={naslov}
                    onChangeText={setNaslov}
                    placeholder="Vnesi naslov"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Opis</Text>
                <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={opis}
                    onChangeText={setOpis}
                    placeholder="Opiši problem"
                    placeholderTextColor="#9CA3AF"
                    multiline
                />

                <Text style={styles.label}>Lokacija</Text>
                <TextInput
                    style={styles.input}
                    value={lokacija}
                    onChangeText={setLokacija}
                    placeholder="Vnesi lokacijo"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Prioriteta</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        style={styles.picker}
                        selectedValue={prioriteta}
                        onValueChange={(itemValue) => setPrioriteta(itemValue)}
                    >
                        <Picker.Item label="Izberi prioriteto" value="" />
                        <Picker.Item label="Nizka" value="Nizka" />
                        <Picker.Item label="Srednja" value="Srednja" />
                        <Picker.Item label="Visoka" value="Visoka" />
                    </Picker>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
                    onPress={submitTicket}
                >
                    <Text style={styles.btnText}>Ustvari spremembo</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}
function PatchOpremaScreen({ navigation, route }: any) {
    const { id, user } = route.params;
    const [naziv, setNaziv] = useState("");
    const [tip, setTip] = useState("");
    const [serijska_stevilka, setserijska] = useState("");
    const [lokacija, setLokacija] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/oprema/${id}`)
            .then(response => response.json())
            .then(data => {
                const oprema = data[0];

                setNaziv(oprema.naziv);
                setTip(oprema.tip);
                setserijska(oprema.serijska_stevilka);
                setLokacija(oprema.lokacija);
                setStatus(oprema.status);
            })
            .catch(error => {
                console.error("Napaka:", error);
            });
    }, [id]);
    const submitOprema = async () => {
        try {
            const response = await fetch(`${API_URL}/oprema/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        naziv: naziv,
                        tip: tip,
                        serijska_stevilka: serijska_stevilka,
                        lokacija: lokacija,
                        status: status
                    }),
                });
            const data = await response.json();

            if (!response.ok) {
                console.error("Napaka:", data);
                return;
            }

            console.log("Oprema spremenjena:", data);

            navigation.navigate("Home", {user:user});
        } catch (error) {
            console.error("Napaka pri pošiljanju:", error);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
            <Text style={styles.title}>Spremeni opremo</Text>

            <View style={styles.formCard}>
                <Text style={styles.label}>Naziv</Text>
                <TextInput
                    style={styles.input}
                    value={naziv}
                    onChangeText={setNaziv}
                    placeholder="Vnesi naziv"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Tip</Text>
                <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={tip}
                    onChangeText={setTip}
                    placeholder="Tip opreme"
                    placeholderTextColor="#9CA3AF"
                    multiline
                />

                <Text style={styles.label}>Serijska stevilka</Text>
                <TextInput
                    style={styles.input}
                    value={serijska_stevilka}
                    onChangeText={setserijska}
                    placeholder="Vnesi serijsko stevilko"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Lokacija</Text>
                <TextInput
                    style={styles.input}
                    value={lokacija}
                    onChangeText={setLokacija}
                    placeholder="Vnesi lokacijo"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        style={styles.picker}
                        selectedValue={status}
                        onValueChange={(itemValue) => setStatus(itemValue)}
                    >
                        <Picker.Item label="Izberi status" value="" />
                        <Picker.Item label="Deluje" value="Deluje" />
                        <Picker.Item label="V opravilu" value="V opravilu" />
                    </Picker>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
                    onPress={submitOprema}
                >
                    <Text style={styles.btnText}>Ustvari spremembo</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}
function statusBadgeStyle(status: string) {
    if (status === "Odprt") return { backgroundColor: "#EEF0FF", borderColor: "#4F5DFF" };
    if (status === "V obravnavi") return { backgroundColor: "#FEF3E2", borderColor: "#F79009" };
    if (status === "Zaprt") return { backgroundColor: "#F0F1F5", borderColor: "#6B7280" };
    if (status === "Deluje") return { backgroundColor: "#E9FBF0", borderColor: "#12B76A" };
    if (status === "V opravilu") return { backgroundColor: "#FEF3E2", borderColor: "#F79009" };
    return { backgroundColor: "#F0F1F5", borderColor: "#6B7280" };
}
function statusTextStyle(status: string) {
    if (status === "Odprt") return { color: "#4F5DFF" };
    if (status === "V obravnavi") return { color: "#F79009" };
    if (status === "Zaprt") return { color: "#6B7280" };
    if (status === "Deluje") return { color: "#12B76A" };
    if (status === "V opravilu") return { color: "#F79009" };
    return { color: "#6B7280" };
}
function priorityBadgeStyle(prioriteta: string) {
    if (prioriteta === "Nizka") return { backgroundColor: "#E9FBF0", borderColor: "#12B76A" };
    if (prioriteta === "Srednja") return { backgroundColor: "#FEF3E2", borderColor: "#F79009" };
    if (prioriteta === "Visoka") return { backgroundColor: "#FDECEC", borderColor: "#E5484D" };
    return { backgroundColor: "#F0F1F5", borderColor: "#6B7280" };
}
function priorityTextStyle(prioriteta: string) {
    if (prioriteta === "Nizka") return { color: "#12B76A" };
    if (prioriteta === "Srednja") return { color: "#F79009" };
    if (prioriteta === "Visoka") return { color: "#E5484D" };
    return { color: "#6B7280" };
}

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: "#fff" },
                    headerTitleStyle: { color: "#1C1E26", fontWeight: "700" },
                    headerTintColor: "#4F5DFF",
                    contentStyle: { backgroundColor: "#F5F6FA" },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ title: "Login" }}
                />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={({ route }) => {
                        // Safely extract the user parameters
                        const user = (route.params as any)?.user || {};
                        const firstName = user.ime || '';
                        const lastName = user.priimek || '';
                        const vloga=user.vloga || '';
                        const fullName = `${firstName} ${lastName}`.trim();

                        return {
                            title: "IT Helpdesk", // Keeps the title on the left (or center on iOS)
                            headerRight: () => (
                                <View style={{ paddingRight: 10 }}>
                                    <Text style={styles.welcomeText}>
                                        Uporabnik: {fullName}
                                    </Text>
                                    <View style={{ paddingRight: 10 }}>
                                        <Text style={styles.welcomeText}>
                                            Vloga: {vloga}
                                        </Text>
                                    </View>
                                </View>


                            ),
                        };
                    }}
                />

                <Stack.Screen
                    name="Ticket"
                    component={TicketScreen}
                    options={({ route }) => {
                        // Safely extract the user parameters
                        const user = (route.params as any)?.user || {};
                        const firstName = user.ime || '';
                        const lastName = user.priimek || '';
                        const vloga=user.vloga || '';
                        const fullName = `${firstName} ${lastName}`.trim();

                        return {
                            title: "Ticket", // Keeps the title on the left (or center on iOS)
                            headerRight: () => (
                                <View style={{ paddingRight: 10 }}>
                                    <Text style={styles.welcomeText}>
                                        Uporabnik: {fullName}
                                    </Text>
                                    <View style={{ paddingRight: 10 }}>
                                        <Text style={styles.welcomeText}>
                                            Vloga: {vloga}
                                        </Text>
                                    </View>
                                </View>


                            ),
                        };
                    }}
                />
                <Stack.Screen
                    name="Oprema"
                    component={OpremaScreen}
                    options={({ route }) => {
                        // Safely extract the user parameters
                        const user = (route.params as any)?.user || {};
                        const firstName = user.ime || '';
                        const lastName = user.priimek || '';
                        const vloga=user.vloga || '';
                        const fullName = `${firstName} ${lastName}`.trim();

                        return {
                            title: "Oprema", // Keeps the title on the left (or center on iOS)
                            headerRight: () => (
                                <View style={{ paddingRight: 10 }}>
                                    <Text style={styles.welcomeText}>
                                        Uporabnik: {fullName}
                                    </Text>
                                    <View style={{ paddingRight: 10 }}>
                                        <Text style={styles.welcomeText}>
                                            Vloga: {vloga}
                                        </Text>
                                    </View>
                                </View>


                            ),
                        };
                    }}
                />
                <Stack.Screen
                    name="CreateTicket"
                    component={CreateTicketScreen}
                    options={({ route }) => {
                        // Safely extract the user parameters
                        const user = (route.params as any)?.user || {};
                        const firstName = user.ime || '';
                        const lastName = user.priimek || '';
                        const vloga=user.vloga || '';
                        const fullName = `${firstName} ${lastName}`.trim();

                        return {
                            title: "Nov ticket", // Keeps the title on the left (or center on iOS)
                            headerRight: () => (
                                <View style={{ paddingRight: 10 }}>
                                    <Text style={styles.welcomeText}>
                                        Uporabnik: {fullName}
                                    </Text>
                                    <View style={{ paddingRight: 10 }}>
                                        <Text style={styles.welcomeText}>
                                            Vloga: {vloga}
                                        </Text>
                                    </View>
                                </View>


                            ),
                        };
                    }}
                />
                <Stack.Screen
                    name="PatchTicket"
                    component={PatchTicketScreen}
                    options={({ route }) => {
                        // Safely extract the user parameters
                        const user = (route.params as any)?.user || {};
                        const firstName = user.ime || '';
                        const lastName = user.priimek || '';
                        const vloga=user.vloga || '';
                        const fullName = `${firstName} ${lastName}`.trim();

                        return {
                            title: "Spremeni ticket", // Keeps the title on the left (or center on iOS)
                            headerRight: () => (
                                <View style={{ paddingRight: 10 }}>
                                    <Text style={styles.welcomeText}>
                                        Uporabnik: {fullName}
                                    </Text>
                                    <View style={{ paddingRight: 10 }}>
                                        <Text style={styles.welcomeText}>
                                            Vloga: {vloga}
                                        </Text>
                                    </View>
                                </View>


                            ),
                        };
                    }}
                />
                <Stack.Screen
                    name="PatchOprema"
                    component={PatchOpremaScreen}
                    options={({ route }) => {
                        // Safely extract the user parameters
                        const user = (route.params as any)?.user || {};
                        const firstName = user.ime || '';
                        const lastName = user.priimek || '';
                        const vloga=user.vloga || '';
                        const fullName = `${firstName} ${lastName}`.trim();

                        return {
                            title: "Spremeni opremo", // Keeps the title on the left (or center on iOS)
                            headerRight: () => (
                                <View style={{ paddingRight: 10 }}>
                                    <Text style={styles.welcomeText}>
                                        Uporabnik: {fullName}
                                    </Text>
                                    <View style={{ paddingRight: 10 }}>
                                        <Text style={styles.welcomeText}>
                                            Vloga: {vloga}
                                        </Text>
                                    </View>
                                </View>


                            ),
                        };
                    }}
                />
                <Stack.Screen
                    name="createOprema"
                    component={CreateOpremaScreen}
                    options={({ route }) => {
                        // Safely extract the user parameters
                        const user = (route.params as any)?.user || {};
                        const firstName = user.ime || '';
                        const lastName = user.priimek || '';
                        const vloga=user.vloga || '';
                        const fullName = `${firstName} ${lastName}`.trim();

                        return {
                            title: "Nova oprema", // Keeps the title on the left (or center on iOS)
                            headerRight: () => (
                                <View style={{ paddingRight: 10 }}>
                                    <Text style={styles.welcomeText}>
                                        Uporabnik: {fullName}
                                    </Text>
                                    <View style={{ paddingRight: 10 }}>
                                        <Text style={styles.welcomeText}>
                                            Vloga: {vloga}
                                        </Text>
                                    </View>
                                </View>


                            ),
                        };
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },
    containerContent: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1C1E26",
        marginBottom: 16,
    },
    headerRow: {
        marginBottom: 16,
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1C1E26",
    },
    subtleText: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    emptyText: {
        color: "#6B7280",
        fontSize: 14,
        textAlign: "center",
        marginTop: 20,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E4E6EE",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardPressed: {
        backgroundColor: "#FAFAFE",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1C1E26",
        marginBottom: 8,
    },
    metaText: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 2,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 6,
    },
    badge: {
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 3,
        paddingHorizontal: 10,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    detailCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: "#E4E6EE",
        marginBottom: 20,
    },
    detailRow: {
        marginTop: 14,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 3,
    },
    detailValue: {
        fontSize: 15,
        color: "#1C1E26",
    },
    btn: {
        backgroundColor: "#4F5DFF",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    btnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    btnGhost: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#4F5DFF",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    btnGhostText: {
        color: "#4F5DFF",
        fontWeight: "700",
        fontSize: 14,
    },
    btnDanger: {
        backgroundColor: "#FDECEC",
        borderWidth: 1,
        borderColor: "#E5484D",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    btnDangerText: {
        color: "#E5484D",
        fontWeight: "700",
        fontSize: 14,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: "#E4E6EE",
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1C1E26",
        marginBottom: 6,
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E4E6EE",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 15,
        color: "#1C1E26",
        backgroundColor: "#FAFBFF",
        marginBottom: 10,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#E4E6EE",
        borderRadius: 10,
        backgroundColor: "#FAFBFF",
        overflow: "hidden",
        marginBottom: 16,
    },
    picker: {
        backgroundColor: "transparent",
    },

    loginContainer: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#F5F6FA",
    },
    loginCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: "#E4E6EE",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    opremaInfo: {
        flex: 1,
    },
    opremaButtons: {
        marginLeft: 15,
        gap: 8,
    },
    iconButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#F0F1F8",
        borderRadius: 8,
        alignItems: "center",
    },
    iconButtonText: {
        color: "#1C1E26",
        fontWeight: "600",
        fontSize: 13,
    },
    iconButtonDanger: {
        backgroundColor: "#FDECEC",
    },
    iconButtonDangerText: {
        color: "#E5484D",
        fontWeight: "600",
        fontSize: 13,
    },
});