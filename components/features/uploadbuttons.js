import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';

const CustomInputArea = () => {
  const [inputText, setInputText] = useState('');
  const [showButtons, setShowButtons] = useState(false);

  const handleCancel = () => {
    setInputText('');
    setShowButtons(false);
  };

  const handleSubmit = () => {
    // Submit logic here
    setShowButtons(false);
  };

  const handleInputFocus = () => {
    setShowButtons(true);
  };

  const handleInputBlur = () => {
    // Only hide the buttons if the input is empty
    if (inputText === '') {
      setShowButtons(false);
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);
    // Show the buttons if the input is not empty
    setShowButtons(text !== '');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, showButtons && styles.inputContainerWithButtons]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Enter text..."
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          multiline
        />
        {showButtons && (
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={handleCancel}>
              <Text>Cancel</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text>Submit</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  inputContainerWithButtons: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  input: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  button: {
     
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 4,
  },
});

export default CustomInputArea;