import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, StatusBar, Image, Pressable, Modal, Linking } from 'react-native';
import { OPENAI_API_KEY } from '@env';
import 'react-native-url-polyfill/auto';
import Spinner from 'react-native-loading-spinner-overlay';


export default function App() {

	// Gestion de l'historique des messages de l'app
	const [messages, setMessages] = useState([]);
	
	// Gestion de l'envoi de messages depuis la zone d'input
	const [inputValue, setInputValue] = useState("");
	
	// Gestion de l'apparition du modal
	const [modalVisible, setModalVisible] = useState(false);
	
	// Gestion de l'apparition du spinner
	const [spinnerVisible, setSpinnerVisible] = useState(false);
	
	// Communication avec l'API d'OpenAPI
	const { Configuration, OpenAIApi } = require("openai");

	const configuration = new Configuration({
		apiKey: OPENAI_API_KEY,
	});
	
	const openai = new OpenAIApi(configuration);
	
	let prompt;

	const handleSend = () => {
		if (inputValue) {
			prompt = inputValue.trim();
			setInputValue("");
			
			// Manipulation pour pouvoir envoyer les messages "un à un"
			setMessages(previousMessages => ([...previousMessages, { id: previousMessages.length + 1, text: prompt, sender: "user" }]));
		}
	};
	
	// Réception de la réponse du bot
	const handleResponse = async () => {
		try {
			setSpinnerVisible(true);
			
			const completion = await openai.createCompletion({
				model: "text-davinci-003",
				prompt: prompt,
				max_tokens: 300
			});

			setSpinnerVisible(false);
			setMessages(previousMessages => ([
				...previousMessages,
				{ id: previousMessages.length + 1, text: completion.data.choices[0].text.trim(), sender: "bot" }]));			
		}
		catch (error) {
			if (error.response) { console.error(`Statut : ${error.response.status}\ninfos : ${error.response.data}`); }
			else { console.error(error.message); }
			
			// Retrait du message envoyé par l'utilisateur
			setMessages([...messages].pop().pop());
		}
	};
	
	const renderItem = ({ item }) => (
		<View style={item.sender === "bot" ? styles.botMessageContainer : styles.myMessageContainer}>
			<Text style={item.sender === "bot" ? styles.botMessage : styles.myMessage}>{ item.text }</Text>
		</View>
	);
	
	const renderModal = ({item}) => (
    <View style={{ marginBottom: 10 }}>
    	{
    		item.link ?
    		
    		<Text style={{ fontSize: 15, fontFamily: 'monospace', color: '#fff' }}>
    			{`\u2023 ${item.key} `}
    			<Text style={{ color: '#00FF41', fontWeight: 'bold', textDecorationColor: '#00FF41', textDecorationLine: 'underline' }} onPress={ () => Linking.openURL(item.link) }>{item.textLink}</Text>
    		</Text>
    		
    		:
    		
        <Text
					style={{ fontSize: 15, fontFamily: 'monospace', color: '#fff' }}>
						{`\u2023 ${item.key}`}
				</Text>    		
    	}
    
    </View>
	);

  return (
    <View style={styles.container}>
    
    	<Spinner
    		visible={spinnerVisible}
    		textContent={'Préparation de la réponse...'}
    		textStyle={{ color: '#00FF41' }}
    		color="#00FF41"
    		overlayColor="rgba(0, 0, 0, 0.65)"/>
    	
    	
    	<View style={styles.topBar}>
    		<View>    		
	    		<Text style={styles.itemTopBar}>My ChatBot v.1.0</Text>
    		</View>
    		<View style={styles.imageTopBarContainer}>
    			<Pressable onPress={ () => setModalVisible(true) }>
		  			<Image source={require('./assets/icon.png')} style={styles.imageTopBar}/>    			
    			</Pressable>
    		</View>
    	</View>
    	
    	<Modal
    		animationType="fade"
    		transparent={true}
    		visible={modalVisible}
    		onRequestClose={() => { setModalVisible(!modalVisible); }}>
    		
		  	<View style={styles.modalOverlay}></View>
		  	
    		<View style={styles.modalContainer}>
			  	<View style={styles.modalTopBar}>
						<View>    		
							<Text style={styles.modalItemTopBar}>À propos</Text>
						</View>
						<View style={styles.imageTopBarContainer}>
							<Pressable onPress={ () => setModalVisible(false) }>
								<Image source={require('./assets/close.png')} style={styles.modalImageTopBar}/>
							</Pressable>
						</View>
					</View>
					
					<View style={styles.modalTextContainer}>
						<FlatList
							data={[
								{ key: 'Développée par', link: 'https://github.com/Mar-Nb', textLink: '@Mar-Nb' },
								{ key: 'Description : Une application permettant de communiquer avec une instance GPT-3 directement depuis son téléphone. Un petit projet au concept simple pour découvrir React Native.' },
								{ key: 'Version : 1.0' },
								{ key: 'Github :', link: 'https://github.com/Mar-Nb/react-native-chatbot', textLink: 'React Native ChatBot' }
							]}
							renderItem={renderModal}/>
					</View>
		  	</View>
    	</Modal>
    
    	<FlatList style={styles.list} data={messages} renderItem={renderItem} keyExtractor={(item) => item.id.toString()}/>
    	
    	<View style={styles.inputContainer}>
    		<TextInput
    			multiline
    			cursorColor="#00FF41"
    			style={styles.input}
    			placeholder="Votre message..."
    			placeholderTextColor="#777"
    			value={inputValue}
    			onChangeText={setInputValue} />
    		
    		<TouchableOpacity style={styles.button} onPress={() => { handleSend(); handleResponse(); }}>
    			<Image source={require('./assets/send.png')}/>
    		</TouchableOpacity>
    	</View>
    </View>
  );
}

const styles = StyleSheet.create({
	list: {
		width: '90%',
		marginVertical: 10
	},
  container: {
    flex: 1,
    backgroundColor: '#202020',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: StatusBar.currentHeight || 0
  },
  botMessageContainer: {
  	width: '65%',
  	padding: 10,
  	marginBottom: 10,
  	borderRadius: 20,
  	borderBottomLeftRadius: 2,
  	alignSelf: 'flex-start',
  	backgroundColor: '#1a1a1a',
  	borderWidth: 1.5,
  	borderColor: '#00ff41'
  },
  botMessage: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'monospace'
  },
  myMessageContainer: {
  	width: '65%',
  	padding: 10,
  	marginBottom: 10,
  	borderRadius: 20,
  	borderBottomRightRadius: 2,
  	alignSelf: 'flex-end',
  	backgroundColor: '#4d4d4d',
  	borderWidth: 1,
  	borderColor: '#008F11'
  },
  myMessage: {
  	fontSize: 16,
  	color: '#fff'
  },
  inputContainer: {
  	width: '100%',
  	flexDirection: 'row',
  	justifyContent: 'center',
  	alignItems: 'center',
  	gap: 5,
  	paddingBottom: 25,
  	paddingTop: 20,
  	backgroundColor: '#0D0208',
  	borderTopWidth: 2,
  	borderTopColor: '#00ff41'
  },
  input: {
    height: 40,
    width: '75%',
    borderColor: '#00ff00',
    borderWidth: 1,
    borderRadius: 10,
    color: '#00ff00',
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#00ff00',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topBar: {
  	width: '100%',
  	flexDirection: 'row',
  	backgroundColor: '#0D0208',
  	borderBottomWidth: 2,
  	borderBottomColor: '#00FF41',
  	paddingLeft: 20,
  	paddingVertical: 17.5,
  	alignContent: 'center'
  },
  modalTopBar: {
  	width: '100%',
  	flexDirection: 'row',
  	backgroundColor: '#0D0208',
  	borderWidth: 1,
  	borderBottomWidth: 2,
  	borderColor: '#00FF41',
  	paddingLeft: 12.5,
  	paddingVertical: 17.5,
  	alignContent: 'center',
  	borderRadius: 12.5,
  	borderBottomLeftRadius: 2,
  	borderBottomRightRadius: 2
  },
  itemTopBar: {
  	fontSize: 25,
  	fontWeight: 'bold',
  	color: '#fff',
  },
  modalItemTopBar: {
  	fontSize: 18,
  	fontWeight: 'bold',
  	color: '#fff'
  },
  imageTopBarContainer: {
  	flex: 1,
  	paddingRight: 15
  },
  imageTopBar: {
  	width: '100%',
  	alignSelf: 'flex-end',
  	width: 40,
  	height: 40,
  	borderRadius: 999
  },
  modalImageTopBar: {
  	height: 30,
  	alignSelf: 'flex-end',
  	borderRadius: 999
  },
  modalContainer: {
  	flex: 1,
  	width: '80%',
  	alignSelf: 'center',
  	alignItems: 'center',
  	justifyContent: 'center',
  	position: 'absolute',
  	top: '30%',
  	zIndex: 999
  },
  modalTextContainer: {
  	backgroundColor: '#0D0208',
  	borderWidth: 1,
  	borderColor: '#00FF41',
  	width: '100%',
  	borderRadius: 12.5,
  	borderTopLeftRadius: 2,
  	borderTopRightRadius: 2,
  	borderTopWidth: 0,
  	padding: 10
  },
  modalOverlay: {
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
		position: 'relative',
		zIndex: 5
  }
});
