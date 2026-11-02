import React, {useState} from 'react';
import {Alert, ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';
import {Button, Card, Divider, Text, TextInput} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {RemoteModelSheet} from '../../components';
import {serverStore} from '../../store';
import {useTheme} from '../../hooks';
import type {ServerConfig} from '../../utils/types';
import type {ServerType} from '../../utils/serverTypes';

const PROVIDER_HINTS =
  'Connect Ollama, llama.cpp, LM Studio, vLLM, or any OpenAI-compatible endpoint (including DeepSeek and OpenRouter). Use the endpoint URL supplied by that provider; API keys are stored in the device keychain.';

export const APIProvidersScreen: React.FC = observer(() => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [pullingId, setPullingId] = useState<string | null>(null);
  const [ollamaNames, setOllamaNames] = useState<Record<string, string>>({});
  const [preset, setPreset] = useState<
    | {
        name: string;
        url: string;
        serverType: ServerType;
      }
    | undefined
  >();

  const openProvider = (provider?: typeof preset) => {
    setPreset(provider);
    setSheetVisible(true);
  };

  const refresh = async (server: ServerConfig) => {
    setRefreshingId(server.id);
    try {
      await serverStore.fetchModelsForServer(server.id);
      navigation.navigate('Models');
    } catch (error) {
      Alert.alert(
        'Could not reach provider',
        error instanceof Error
          ? error.message
          : 'Check the URL and connection.',
      );
    } finally {
      setRefreshingId(null);
    }
  };

  const pullOllamaModel = async (server: ServerConfig) => {
    const modelName = (ollamaNames[server.id] ?? '').trim();
    if (!modelName) {
      Alert.alert(
        'Model name required',
        'Enter an Ollama model name, such as llama3.2 or qwen3.',
      );
      return;
    }
    const baseUrl = server.url.replace(/\/+$/, '').replace(/\/v1$/i, '');
    setPullingId(server.id);
    try {
      const response = await fetch(`${baseUrl}/api/pull`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: modelName, stream: false}),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Ollama returned HTTP ${response.status}`);
      }
      await serverStore.fetchModelsForServer(server.id);
      Alert.alert('Model ready', `${modelName} was pulled to ${server.name}.`);
    } catch (error) {
      Alert.alert(
        'Ollama pull failed',
        error instanceof Error
          ? error.message
          : 'Check that the Ollama server is reachable.',
      );
    } finally {
      setPullingId(null);
    }
  };

  const remove = (server: ServerConfig) => {
    Alert.alert('Remove provider?', `Remove ${server.name} from Doom AI?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => serverStore.removeServer(server.id),
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView contentContainerStyle={{padding: 16, gap: 12}}>
        <Text
          variant="bodyMedium"
          style={{color: theme.colors.onSurfaceVariant}}>
          {PROVIDER_HINTS}
        </Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => openProvider()}
          testID="api-provider-add">
          Connect a provider
        </Button>
        <Text variant="titleSmall" style={{marginTop: 4}}>
          Quick setup
        </Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
          <Button
            mode="outlined"
            compact
            onPress={() =>
              openProvider({
                name: 'DeepSeek',
                url: 'https://api.deepseek.com/v1',
                serverType: 'OpenAI',
              })
            }>
            DeepSeek
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() =>
              openProvider({
                name: 'Gemini API',
                url: 'https://generativelanguage.googleapis.com/v1beta/openai/',
                serverType: 'OpenAI',
              })
            }>
            Gemini
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() =>
              openProvider({
                name: 'OpenRouter',
                url: 'https://openrouter.ai/api/v1',
                serverType: 'OpenAI',
              })
            }>
            OpenRouter
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() =>
              openProvider({name: 'Ollama', url: '', serverType: 'Ollama'})
            }>
            Ollama (local)
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() =>
              openProvider({
                name: 'LM Studio',
                url: '',
                serverType: 'LM Studio',
              })
            }>
            LM Studio (local)
          </Button>
        </View>
        <Text
          variant="bodySmall"
          style={{color: theme.colors.onSurfaceVariant}}>
          These use provider-issued API keys. ChatGPT/Claude consumer
          subscriptions are not interchangeable with API credentials.
        </Text>
        {serverStore.servers.length === 0 ? (
          <Card mode="outlined">
            <Card.Content>
              <Text variant="titleMedium">No providers connected</Text>
              <Text variant="bodyMedium" style={{marginTop: 6}}>
                Add a local server or an OpenAI-compatible API to use its
                models.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          serverStore.servers.map(server => (
            <Card
              key={server.id}
              mode="outlined"
              testID={`api-provider-${server.id}`}>
              <Card.Content style={{gap: 4}}>
                <Text variant="titleMedium">{server.name}</Text>
                <Text
                  variant="bodySmall"
                  style={{color: theme.colors.onSurfaceVariant}}>
                  {server.url}
                </Text>
                <Text
                  variant="labelSmall"
                  style={{color: theme.colors.primary}}>
                  {server.serverType || 'OpenAI-compatible'}
                </Text>
              </Card.Content>
              {server.serverType?.toLowerCase().startsWith('ollama') && (
                <Card.Content style={{gap: 8}}>
                  <Text variant="labelLarge">Pull a model to Ollama</Text>
                  <TextInput
                    mode="outlined"
                    dense
                    label="Ollama model name"
                    placeholder="qwen3:8b"
                    value={ollamaNames[server.id] ?? ''}
                    onChangeText={name =>
                      setOllamaNames(current => ({
                        ...current,
                        [server.id]: name,
                      }))
                    }
                    testID={`ollama-model-name-${server.id}`}
                  />
                  <Button
                    mode="contained-tonal"
                    onPress={() => pullOllamaModel(server)}
                    loading={pullingId === server.id}
                    disabled={pullingId !== null}>
                    Pull to Ollama
                  </Button>
                </Card.Content>
              )}
              <Divider />
              <Card.Actions>
                <Button
                  onPress={() => refresh(server)}
                  loading={refreshingId === server.id}
                  disabled={refreshingId !== null}>
                  Browse models
                </Button>
                <Button
                  textColor={theme.colors.error}
                  onPress={() => remove(server)}>
                  Remove
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
        <View style={{height: 8}} />
      </ScrollView>
      <RemoteModelSheet
        isVisible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        onModelAdded={() => setSheetVisible(false)}
        initialProvider={preset}
      />
    </SafeAreaView>
  );
});
