import React, { useEffect, useState } from "react";
import { View, Pressable, Text, Alert, Button, Share } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'
import { styles } from "./styles";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingFileUri, setRecordingFileUri] = useState<string | null>(null);  
  
  const handleRecordingStart = async () => {
    const { granted } = await Audio.getPermissionsAsync();

    if (granted) {
      try {
        const recordingObject = new Audio.Recording();
        await recordingObject.prepareToRecordAsync();
        await recordingObject.startAsync();
        setRecording(recordingObject);
      } catch (error) {
        console.log(error);
        Alert.alert('Erro ao gravar', 'Não foi possível iniciar a gravação do áudio')
      }
    }
  };

  const handleRecordingStop = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log(uri);
        setRecordingFileUri(uri);
        setRecording(null);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erro ao gravar', 'Não foi possível parar a gravação do áudio');
    }
  };

  const handleAudioPlay = async () => {
    if(recordingFileUri){
      try {
        const soundObject = new Audio.Sound();
        await soundObject.loadAsync({uri: recordingFileUri});
        await soundObject.setVolumeAsync(1.0); 
        await soundObject.playAsync();
      } catch (error) {
        console.log(error);
        Alert.alert('Erro ao reproduzir', 'Não foi possível reproduzir o áudio');
      }
    }
  };

  const handleShareAudio = async () => {
    if (recordingFileUri) {
      try {
        await Share.share({
          url: recordingFileUri,
          title: "Compartilhar áudio"
        });
      } catch (error) {
        console.log(error);
        Alert.alert('Erro ao compartilhar', 'Não foi possível compartilhar o áudio');
      }
    }
  };

  useEffect(() => {
    Audio.requestPermissionsAsync().then(({ granted }) => {
      if (granted) {
        Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true, 
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false, 
        });
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={recording ? handleRecordingStop : handleRecordingStart} 
        style={[styles.button, recording && styles.recording]}
      >
        <MaterialIcons name={recording ? "stop" : "mic"} size={44} color="#212121"/>
      </Pressable>
      <Text style={styles.label}>
        {recording ? "Gravando" : ""}
      </Text>
      { recordingFileUri !== null &&
      <Button title="Ouvir áudio" onPress={handleAudioPlay}/>
      }
      { recordingFileUri !== null &&
      <Button title="Compartilhar áudio" onPress={handleShareAudio}/>
      }
    </View>
  );
}
