import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, Button, TextInput } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const API_URL = "http://localhost:2500";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }: any) {
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
                onPress={() => navigation.navigate("CreateTicket")}
            />

            {tickets.map(ticket => (
                <Pressable
                    key={ticket.id}
                    style={styles.ticket}
                    onPress={() => navigation.navigate("Ticket", {
                        id: ticket.id
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

function TicketScreen({ route }: any) {
    const { id } = route.params;
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

            navigation.navigate("Home");
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

function CreateTicketScreen({ navigation }: any) {
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
                        prijavitelj: 1,
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

            navigation.navigate("Home");
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
            <TextInput
                style={styles.input}
                value={prioriteta}
                onChangeText={setPrioriteta}
                placeholder="Nizka / Srednja / Visoka"
            />

            <Button
                title="Ustvari ticket"
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
    }
});