import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, Button, TextInput } from "react-native";
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
        <View style={styles.container}>
            <Text style={styles.title}>IT Helpdesk</Text>

            <Button
                title="Nov ticket"
                onPress={() => navigation.navigate("CreateTicket", {user:user})}
            />

            {tickets
                .filter(ticket =>
                    user.vloga === "Administrator" ||
                    ticket.prijavitelj === `${user.ime} ${user.priimek}`
                )
                .map(ticket => (
                    <Pressable
                        key={ticket.id}
                        style={styles.ticket}
                        onPress={() => navigation.navigate("Ticket", {
                            id: ticket.id,
                            user: user
                        })}
                    >
                        <Text style={styles.ticketTitle}>
                            {ticket.naslov}
                        </Text>

                        <Text>Status: {ticket.status}</Text>
                        <Text>Prioriteta: {ticket.prioriteta}</Text>
                    </Pressable>
                ))}
            {user.vloga === "Administrator" && (
                <Button
                    title="Oprema"
                    onPress={() => navigation.navigate("Oprema", { user: user })}
                />
            )}
            <Text>Prijavljen: {user.ime} {user.priimek}</Text>
            <Text>Vloga: {user.vloga}</Text>
        </View>
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
        <View style={styles.container}>
            {oprema.map(oprema => (
                <View style={styles.opremaItem}>
                    <Pressable
                        style={styles.opremaInfo}
                        onPress={() => navigation.navigate("Oprema", {
                            id: oprema.id,
                            user: user
                        })}
                    >
                        <Text style={styles.opremaTitle}>
                            {oprema.naziv}
                        </Text>

                        <Text>Tip: {oprema.tip}</Text>
                        <Text>Serijska st.: {oprema.serijska_stevilka}</Text>
                        <Text>Lokacija: {oprema.lokacija}</Text>
                        <Text>Status: {oprema.status}</Text>
                    </Pressable>

                    <View style={styles.opremaButtons}>
                        <Pressable
                            style={styles.opremaButton}
                            onPress={() => navigation.navigate("PatchOprema", {
                                id: oprema.id,
                                user: user
                            })}
                        >
                            <Text>Uredi</Text>
                        </Pressable>

                        <Pressable
                            style={styles.opremaButton}
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
                        <Text>Izbrisi</Text>
                    </Pressable>
                    </View>
                </View>
            ))}
        </View>
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
                <Text>Nalaganje...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{ticket.naslov}</Text>
            <Text>Opis: {ticket.opis}</Text>
            <Text>Status: {ticket.status}</Text>
            <Text>Prioriteta: {ticket.prioriteta}</Text>
            <Text>Lokacija: {ticket.lokacija}</Text>
            <Text>Prijavitelj: {ticket.prijavitelj}</Text>
            <Text>Datum: {ticket.datum}</Text>
            <Text>Resitev: {ticket.resitev || "Se ni reseno"}</Text>
            <Text>Oprema ID: {ticket.oprema_id || "Ni dolocenaa"}</Text>

            {user.vloga === "Administrator" && (
                <>
                    <Button
                        title="Uredi ticket"
                        onPress={() => navigation.navigate("PatchTicket", {
                            id: ticket.id,
                            user: user
                        })}
                    />

                    <Button
                        title="Izbriši ticket"
                        color="red"
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
                    />
                </>
            )}
        </View>
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
        <View style={styles.container}>
            <Text style={styles.title}>IT Helpdesk</Text>
            <Text>Email</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Vnesi email"
            />
            <Button
                title="Prijava"
                onPress={login}
            />
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
        <View style={styles.container}>
            <Text style={styles.title}>Nov ticket</Text>

            <Text>Naslov</Text>
            <TextInput
                style={styles.input}
                value={naslov}
                onChangeText={setNaslov}
                placeholder="Vnesi naslov"
            />

            <Text>Opis</Text>
            <TextInput
                style={styles.input}
                value={opis}
                onChangeText={setOpis}
                placeholder="Opiši problem"
                multiline
            />

            <Text>Lokacija</Text>
            <TextInput
                style={styles.input}
                value={lokacija}
                onChangeText={setLokacija}
                placeholder="Vnesi lokacijo"
            />

            <Text>Prioriteta</Text>
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

            <Button
                title="Ustvari ticket"
                onPress={submitTicket}
            />

        </View>
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
                        prijavitelj: user.id,
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
        <View style={styles.container}>
            <Text style={styles.title}>Nov ticket</Text>

            <Text>Naslov</Text>
            <TextInput
                style={styles.input}
                value={naslov}
                onChangeText={setNaslov}
                placeholder="Vnesi naslov"
            />

            <Text>Opis</Text>
            <TextInput
                style={styles.input}
                value={opis}
                onChangeText={setOpis}
                placeholder="Opiši problem"
                multiline
            />

            <Text>Lokacija</Text>
            <TextInput
                style={styles.input}
                value={lokacija}
                onChangeText={setLokacija}
                placeholder="Vnesi lokacijo"
            />

            <Text>Prioriteta</Text>
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

            <Button
                title="Ustvari spremembo"
                onPress={submitTicket}
            />

        </View>
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
        <View style={styles.container}>
            <Text style={styles.title}>Nov ticket</Text>

            <Text>Naziv</Text>
            <TextInput
                style={styles.input}
                value={naziv}
                onChangeText={setNaziv}
                placeholder="Vnesi naziv"
            />

            <Text>Tip</Text>
            <TextInput
                style={styles.input}
                value={tip}
                onChangeText={setTip}
                placeholder="Tip opreme"
                multiline
            />


            <Text>Serijska stevilka</Text>
            <TextInput
                style={styles.input}
                value={serijska_stevilka}
                onChangeText={setserijska}
                placeholder="Vnesi serijsko stevilko"
            />

            <Text>Lokacija</Text>
            <TextInput
                style={styles.input}
                value={lokacija}
                onChangeText={setLokacija}
                placeholder="Vnesi lokacijo"
            />



            <Button
                title="Ustvari spremembo"
                onPress={submitOprema}
            />

        </View>
    );
}



export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ title: "Login" }}
                />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: "IT Helpdesk" }}
                />

                <Stack.Screen
                    name="Ticket"
                    component={TicketScreen}
                    options={{ title: "Ticket" }}
                />
                <Stack.Screen
                    name="Oprema"
                    component={OpremaScreen}
                    options={{ title: "Oprema" }}
                />
                <Stack.Screen
                    name="CreateTicket"
                    component={CreateTicketScreen}
                    options={{ title: "Nov ticket" }}
                />
                <Stack.Screen
                    name="PatchTicket"
                    component={PatchTicketScreen}
                    options={{ title: "Spremeni ticket" }}
                />
                <Stack.Screen
                    name="PatchOprema"
                    component={PatchOpremaScreen}
                    options={{ title: "Spremeni opremo" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    ticket: {
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderRadius: 8,
    },
    ticketTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
        marginBottom: 15,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
        marginBottom: 15,
    },
    picker: {
        backgroundColor: "transparent",
        borderWidth: 0,
        borderColor: "transparent"
    },
    opremaItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#eee",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "black",
    },

    opremaInfo: {
        flex: 1,
    },

    opremaTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },

    opremaButtons: {
        marginLeft: 15,
        gap: 8,
    },

    opremaButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#ddd",
        borderRadius: 5,
    },
});