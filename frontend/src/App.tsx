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
                    name="CreateTicket"
                    component={CreateTicketScreen}
                    options={{ title: "Nov ticket" }}
                />
                <Stack.Screen
                    name="PatchTicket"
                    component={PatchTicketScreen}
                    options={{ title: "Spremeni ticket" }}
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
    }
});