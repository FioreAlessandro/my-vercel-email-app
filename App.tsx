import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet, Image, TouchableOpacity, FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import emailjs from 'emailjs-com';

// Dati di esempio per il menu (devi definire MENU da qualche parte nel tuo codice)
const MENU = [
  { id: '1', name: 'Pasta', price: 8, image: 'https://example.com/pasta.jpg' },
  { id: '2', name: 'Pizza', price: 10, image: 'https://example.com/pizza.jpg' },
  // aggiungi altri piatti qui...
];

const Stack = createNativeStackNavigator();

function RegistrationScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    if (!username || !password) {
      Alert.alert('Errore', 'Inserisci username e password');
      return;
    }
    try {
      const users = JSON.parse(await AsyncStorage.getItem('users')) || {};
      if(users[username]) {
        Alert.alert('Errore', 'Username già esistente');
        return;
      }
      users[username] = password;
      await AsyncStorage.setItem('users', JSON.stringify(users));
      Alert.alert('Successo', 'Registrazione avvenuta con successo');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Errore', 'Impossibile registrare');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrati</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize='none'
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Registrati" onPress={register} />
      <Button title="Vai al Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    if (!username || !password) {
      Alert.alert('Errore', 'Inserisci username e password');
      return;
    }
    try {
      const users = JSON.parse(await AsyncStorage.getItem('users')) || {};
      if (users[username] && users[username] === password) {
        navigation.navigate('Home', { username });
      } else {
        Alert.alert('Errore', 'Username o password errati');
      }
    } catch (e) {
      Alert.alert('Errore', 'Errore durante il login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize='none'
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Accedi" onPress={login} />
      <Button title="Registrati" onPress={() => navigation.navigate('Registration')} />
    </View>
  );
}

function HomeScreen({ navigation, route }) {
  const { username, email } = route.params || {};
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://res.cloudinary.com/dvxlm9c6i/image/upload/v1749404853/bar_csS_logo_1__page-0001_1_ngy7rg.jpg' }}
        style={styles.logo}
      />
      <Text style={styles.title}>Ciao {username}, benvenuto alla Cucina di Nonna</Text>
      <Button title="Visualizza Menu" onPress={() => navigation.navigate('Menu', { username, email })} />
    </View>
  );
}

function MenuScreen({ navigation, route }) {
  const { username, email } = route.params || {};
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Indietro</Text>
      </TouchableOpacity>
      <FlatList
        data={MENU}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.itemText}>{item.name} - €{item.price}</Text>
            <Button title="Aggiungi" onPress={() => addToCart(item)} />
          </View>
        )}
      />
      <Button title={`Vai al carrello (${cart.length})`} onPress={() => navigation.navigate('Carrello', { cart, username, email })} />
    </View>
  );
}

function CartScreen({ route, navigation }) {
  const { cart, username, email } = route.params || { cart: [], username: '', email: '' };
  const totale = cart.reduce((sum, item) => sum + item.price, 0);

  // ATTENZIONE: devi importare e configurare emailjs per far funzionare questa funzione
  const confirmOrder = () => {
    const orderDetails = cart.map(item => `${item.name} - €${item.price}`).join('\n') + `\nTotale: €${totale}`;

    emailjs.send(
      'service_jjbm2yx',
      'template_2p770hb',
      {
        user_name: username,
        user_email: email,
        order_details: orderDetails
      },
      'qGwxQvo-7Kzd74uOf'
    ).then(() => {
      Alert.alert('Ordine confermato!', 'Riceverai una conferma via email.');
      navigation.navigate('Conferma', { username, email });
    }).catch((error) => {
  console.log('EmailJS error:', error);
  Alert.alert('Errore', 'Impossibile inviare l’ordine: ' + (error.text || 'Errore sconosciuto'));
});

  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Indietro</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Il tuo ordine:</Text>
      {cart.map((item, index) => (
        <Text key={index}>{item.name} - €{item.price}</Text>
      ))}
      <Text style={styles.title}>Totale: €{totale}</Text>
      <Button title="Conferma ordine" onPress={confirmOrder} />
    </View>
  );
}

function OrderSuccessScreen({ route, navigation }) {
  const { username } = route.params || {};
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', { username })}>
        <Text style={styles.backText}>← Torna alla Home</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Grazie {username}!</Text>
      <Text>Il tuo ordine è stato ricevuto. Presentati in cassa per il pagamento.</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Carrello" component={CartScreen} />
        <Stack.Screen name="Conferma" component={OrderSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fdf6f0',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  item: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },
  itemText: {
    fontSize: 18,
    marginVertical: 10,
  },
  image: {
    width: 150,
    height: 100,
    borderRadius: 8,
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff'
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF'
  }
});
