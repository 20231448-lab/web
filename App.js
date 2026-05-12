// =============================
// 📌 [1] 기본 import & 설정
// =============================
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Animated,
  Platform,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  PanResponder,
  Dimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar } from 'react-native-calendars';

import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
const IS_WEB = Platform.OS === 'web';
const SCREEN_WIDTH = Dimensions.get('window').width;
import * as Location from 'expo-location';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// =============================
// 📌 [2] 감정 목록
// =============================
const ALL_EMOTIONS = [
  { name: '기쁨', emoji: '😄' },
  { name: '평온', emoji: '🙂' },
  { name: '감사', emoji: '🥰' },
  { name: '피곤', emoji: '😵‍💫' },
  { name: '불안', emoji: '😥' },
  { name: '놀람', emoji: '😲' },
  { name: '슬픔', emoji: '😢' },
  { name: '화남', emoji: '😡' },
];

// =============================
// 📌 [3] 기본 색상
// =============================
const BASE_COLORS = {
  bg: '#F4FAF4',
  card: '#FFFFFF',
  primary: '#7BAE7F',
  primaryDeep: '#4F7C57',
  greenLight: '#DDEEDC',
  greenSoft: '#CFE6CD',
  greenMint: '#EEF8EE',
  peach: '#D9EFCF',
  yellow: '#E8F3C7',
  text: '#2F4031',
  sub: '#6C806E',
  border: '#D7E7D6',
  red: '#C97D7D',
  softBrown: '#5D6E5F',
  icon: '#6F9A73',
};

// =============================
// 📌 [4] 테마
// =============================
const THEME_OPTIONS = {
  forest: {
    label: '숲빛',
    ...BASE_COLORS,
  },
  peach: {
    label: '복숭아빛',
    bg: '#FFF9F5',
    card: '#FFFFFF',
    primary: '#D9A28F',
    primaryDeep: '#B67866',
    greenLight: '#F6E3DD',
    greenSoft: '#F1D4C9',
    greenMint: '#FAEEEA',
    peach: '#F3D2C7',
    yellow: '#F6E5BE',
    text: '#46332D',
    sub: '#94766D',
    border: '#F0DFD8',
    red: '#D88C8C',
    softBrown: '#8B6F66',
    icon: '#C78F7A',
  },
  sky: {
    label: '하늘빛',
    bg: '#F3F8FF',
    card: '#FFFFFF',
    primary: '#7FAEEB',
    primaryDeep: '#4F79B8',
    greenLight: '#DCEBFF',
    greenSoft: '#D4E5FA',
    greenMint: '#EEF5FF',
    peach: '#D9E8FF',
    yellow: '#F1F6C9',
    text: '#2D3E57',
    sub: '#6B7F99',
    border: '#D7E4F5',
    red: '#D48787',
    softBrown: '#627086',
    icon: '#6A93CC',
  },
  lavender: {
    label: '라벤더빛',
    bg: '#FAF6FF',
    card: '#FFFFFF',
    primary: '#B497D6',
    primaryDeep: '#7B5FA6',
    greenLight: '#E9DDF7',
    greenSoft: '#E2D4F2',
    greenMint: '#F5EEFC',
    peach: '#E7D9F5',
    yellow: '#F4EFC8',
    text: '#48385F',
    sub: '#88779E',
    border: '#E5DDF0',
    red: '#CB8AA2',
    softBrown: '#786A8E',
    icon: '#9A84BD',
  },
};

function getThemeColors(themeKey) {
  return THEME_OPTIONS[themeKey] || THEME_OPTIONS.forest;
}

// =============================
// 📌 [5] Context
// =============================
const ThemeContext = createContext({
  theme: BASE_COLORS,
  themeKey: 'forest',
  updateThemeKey: async () => {},
});

function useAppTheme() {
  return useContext(ThemeContext);
}

// =============================
// 📌 [6] 저장 키
// =============================
const STORAGE_KEYS = {
  users: 'mind_users_local_v1',
  autoLogin: 'mind_auto_login_local_v1',
  profiles: 'mind_profiles_local_v1',
  diaries: 'diary_list',
  settings: 'mind_settings_local_v1',
  attendance: 'mind_attendance_local_v1',
  tree: 'mind_tree_local_v1',
  shop: 'mind_shop_local_v1',
  pss: 'pss_list',
};

const DEFAULT_SETTINGS = {
  notificationMessage: '오늘의 마음을 천천히 기록해보세요 🌿',
  themeKey: 'forest',
  weatherEnabled: true,
  reminderBannerEnabled: true,
};

const AVATARS = ['👤', '🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🦌', '🐿️', '🐸', '🦉', '🍀'];

const SHOP_ITEMS = [
  { id: 'flowerpot', name: '꽃화분', icon: '🪴', price: 1, category: 'plant' },
  { id: 'cat', name: '고양이 친구', icon: '🐱', price: 2, category: 'animal' },
  { id: 'bench', name: '작은 벤치', icon: '🪑', price: 2, category: 'furniture' },
  { id: 'bird', name: '새 친구', icon: '🐦', price: 2, category: 'animal' },
  { id: 'stone', name: '정원 돌', icon: '🪨', price: 1, category: 'decor' },
  { id: 'lamp', name: '가든 조명', icon: '🏮', price: 3, category: 'decor' },
  { id: 'tulip', name: '튤립 화단', icon: '🌷', price: 2, category: 'plant' },
  { id: 'sunflower', name: '해바라기', icon: '🌻', price: 2, category: 'plant' },
  { id: 'mushroom', name: '버섯 장식', icon: '🍄', price: 1, category: 'decor' },
  { id: 'butterfly', name: '나비 친구', icon: '🦋', price: 2, category: 'animal' },
  { id: 'rabbit', name: '토끼 친구', icon: '🐰', price: 3, category: 'animal' },
  { id: 'fountain', name: '작은 분수', icon: '⛲', price: 4, category: 'furniture' },
  { id: 'picnic', name: '피크닉 매트', icon: '🧺', price: 3, category: 'furniture' },
  { id: 'mailbox', name: '숲속 우체통', icon: '📮', price: 2, category: 'decor' },
  { id: 'lanternTree', name: '반짝 전구 장식', icon: '✨', price: 3, category: 'decor' },
  { id: 'squirrel', name: '다람쥐 친구', icon: '🐿️', price: 3, category: 'animal' },
];

const SPLASH_VARIANTS = [
  { emoji: '🌿', title: '마음 정원', sub: '숲처럼 천천히, 마음을 기록해요' },
  { emoji: '🍃', title: '마음 정원', sub: '오늘 하루를 부드럽게 남겨보세요' },
  { emoji: '🌳', title: '마음 정원', sub: '작은 감정이 모여 숲이 됩니다' },
];

const DEFAULT_ITEM_SCALE = 1;
const MIN_ITEM_SCALE = 0.7;
const MAX_ITEM_SCALE = 1.8;



// =============================
// 📌 [8] 공용 유틸
// =============================
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDateLabel = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
};

const weekdayLabel = (dateKey) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(`${dateKey}T00:00:00`).getDay()];
};

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function getPickerImageUri(asset) {
  if (!asset) return null;

  if (IS_WEB && asset.base64) {
    const mime = asset.mimeType || 'image/jpeg';
    return `data:${mime};base64,${asset.base64}`;
  }

  return asset.uri || null;
}

async function getCurrentCoordsForWeather() {
  if (IS_WEB) {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('geolocation-not-supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => reject(new Error('permission-denied')),
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 1000 * 60 * 10,
        }
      );
    });
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) throw new Error('location-disabled');

  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') throw new Error('permission-denied');

  const position = await Location.getCurrentPositionAsync({});

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

const getTreeEmoji = (count) => {
  if (count >= 100) return '🌳';
  if (count >= 50) return '🌲';
  if (count >= 20) return '🌿';
  return '🌱';
};

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const normalizePlacedItem = (item, fallbackZ = 1) => ({
  id: item.id,
  x: typeof item.x === 'number' ? item.x : 40,
  y: typeof item.y === 'number' ? item.y : 120,
  scale:
    typeof item.scale === 'number'
      ? clamp(item.scale, MIN_ITEM_SCALE, MAX_ITEM_SCALE)
      : DEFAULT_ITEM_SCALE,
  zIndex: typeof item.zIndex === 'number' ? item.zIndex : fallbackZ,
});

async function getJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function setJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// =============================
// 📌 [8-1] 날씨 유틸 추가
// =============================
function getWeatherLabel(weatherCode) {
  if (weatherCode === 0) return { text: '맑음', emoji: '☀️' };
  if ([1, 2, 3].includes(weatherCode)) return { text: '구름', emoji: '⛅' };
  if ([45, 48].includes(weatherCode)) return { text: '안개', emoji: '🌫️' };
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return { text: '이슬비', emoji: '🌦️' };
  if ([61, 63, 65, 66, 67].includes(weatherCode)) return { text: '비', emoji: '🌧️' };
  if ([71, 73, 75, 77].includes(weatherCode)) return { text: '눈', emoji: '❄️' };
  if ([80, 81, 82].includes(weatherCode)) return { text: '소나기', emoji: '🌦️' };
  if ([85, 86].includes(weatherCode)) return { text: '눈 소나기', emoji: '🌨️' };
  if ([95, 96, 99].includes(weatherCode)) return { text: '천둥번개', emoji: '⛈️' };
  return { text: '날씨 정보', emoji: '🌤️' };
}

async function fetchWeatherByCoords(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weather_code,apparent_temperature,is_day&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('weather-fetch-failed');
  }

  const data = await response.json();
  const current = data?.current;

  if (!current) {
    throw new Error('weather-data-empty');
  }

  const info = getWeatherLabel(current.weather_code);

  return {
    temperature: Math.round(current.temperature_2m),
    apparentTemperature: Math.round(current.apparent_temperature),
    weatherCode: current.weather_code,
    weatherText: info.text,
    weatherEmoji: info.emoji,
    isDay: current.is_day,
  };
}

function getWeatherCardTheme(weatherCode, isDay, theme) {
  let accent = theme.primaryDeep;
  let chipBg = theme.greenLight;
  let title = '오늘의 날씨예요';
  let message = '오늘의 하늘 아래 마음도 천천히 기록해보세요.';

  if (weatherCode === 0) {
    accent = theme.primaryDeep;
    chipBg = theme.yellow;
    title = isDay ? '햇살이 부드러운 날이에요' : '맑은 밤이에요';
    message = isDay
      ? '햇살 좋은 하루예요. 오늘의 마음도 가볍게 남겨보세요.'
      : '차분한 밤공기처럼 마음도 천천히 쉬어가요.';
  } else if ([1, 2, 3].includes(weatherCode)) {
    accent = theme.softBrown;
    chipBg = theme.greenLight;
    title = isDay ? '구름이 살짝 낀 하늘이에요' : '구름 낀 밤이에요';
    message = '조금 흐린 날엔 마음도 더 천천히 들여다보기 좋아요.';
  } else if ([45, 48].includes(weatherCode)) {
    accent = theme.sub;
    chipBg = theme.greenMint;
    title = '안개 낀 날이에요';
    message = '시야가 흐린 날엔 마음도 조용히 정리해보세요.';
  } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    accent = theme.icon;
    chipBg = theme.greenMint;
    title = '촉촉한 비가 오는 날이에요';
    message = '비 오는 날엔 조금 느리게 흘러가도 괜찮아요.';
  } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    accent = theme.primary;
    chipBg = theme.card;
    title = '눈 내리는 날이에요';
    message = '포근하고 조용한 하루예요. 마음도 따뜻하게 적어보세요.';
  } else if ([95, 96, 99].includes(weatherCode)) {
    accent = theme.red;
    chipBg = theme.greenLight;
    title = '하늘이 요란한 날이에요';
    message = '바깥이 복잡할수록 마음은 더 차분히 돌봐주세요.';
  }

  return {
    bg: theme.card,
    accent,
    chipBg,
    title,
    message,
  };
}

// =============================
// 📌 [9] 로컬 저장 로드/세이브
// =============================
async function loadUsers() {
  const users = await getJson(STORAGE_KEYS.users, {});
  const migrated = {};

  Object.keys(users).forEach((id) => {
    const item = users[id];

    if (typeof item === 'string') {
      migrated[id] = {
        id,
        password: item,
        email: '',
        phone: '',
        provider: 'local',
        createdAt: Date.now(),
      };
    } else {
      migrated[id] = {
        id: item.id || id,
        password: item.password || '',
        email: item.email || '',
        phone: item.phone || '',
        provider: item.provider || 'local',
        createdAt: item.createdAt || Date.now(),
      };
    }
  });

  return migrated;
}

async function saveUsers(users) {
  await setJson(STORAGE_KEYS.users, users);
}

async function loadProfiles() {
  return await getJson(STORAGE_KEYS.profiles, {});
}

async function saveProfiles(profiles) {
  await setJson(STORAGE_KEYS.profiles, profiles);
}

async function loadProfile(userId) {
  const profiles = await loadProfiles();
  return profiles[userId] || { nickname: userId, avatar: '👤', photoUri: '' };
}

async function saveProfile(userId, profile) {
  const profiles = await loadProfiles();
  profiles[userId] = profile;
  await saveProfiles(profiles);
}

async function loadDiaries() {
  return await getJson(STORAGE_KEYS.diaries, []);
}

async function saveDiaries(diaries) {
  await setJson(STORAGE_KEYS.diaries, diaries);
}

async function loadPssList() {
  return await getJson(STORAGE_KEYS.pss, []);
}

async function savePssList(list) {
  await setJson(STORAGE_KEYS.pss, list);
}

async function loadSettings() {
  const saved = await getJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...saved };
}

async function saveSettings(settings) {
  await setJson(STORAGE_KEYS.settings, settings);
}

async function loadAttendance() {
  return await getJson(STORAGE_KEYS.attendance, {});
}

async function saveAttendance(attendance) {
  await setJson(STORAGE_KEYS.attendance, attendance);
}

async function loadTreeAll() {
  return await getJson(STORAGE_KEYS.tree, {});
}

async function saveTreeAll(data) {
  await setJson(STORAGE_KEYS.tree, data);
}

async function loadTree(userId) {
  const all = await loadTreeAll();
  return (
    all[userId] || {
      droplets: 0,
      waterCount: 0,
      fruits: 0,
      lastAttendanceRewardDate: '',
    }
  );
}

async function saveTree(userId, tree) {
  const all = await loadTreeAll();
  all[userId] = tree;
  await saveTreeAll(all);
}

async function loadShopAll() {
  return await getJson(STORAGE_KEYS.shop, {});
}

async function saveShopAll(data) {
  await setJson(STORAGE_KEYS.shop, data);
}

async function loadShop(userId) {
  const all = await loadShopAll();
  const saved = all[userId] || {};

  const owned = Array.isArray(saved.owned) ? saved.owned : [];
  const rawPlaced = Array.isArray(saved.placed) ? saved.placed : [];

  const placed = rawPlaced.map((item, index) =>
    normalizePlacedItem(
      {
        ...item,
        scale:
          typeof item.scale === 'number'
            ? item.scale
            : DEFAULT_ITEM_SCALE,
      },
      index + 1
    )
  );

  const itemStates = {};
  placed.forEach((item, index) => {
    itemStates[item.id] = {
      x: item.x,
      y: item.y,
      scale:
        typeof item.scale === 'number'
          ? item.scale
          : DEFAULT_ITEM_SCALE,
      zIndex: typeof item.zIndex === 'number' ? item.zIndex : index + 1,
    };
  });

  return {
    owned,
    placed,
    itemStates,
  };
}

async function saveShop(userId, shop) {
  const all = await loadShopAll();

  all[userId] = {
    owned: Array.isArray(shop.owned) ? shop.owned : [],
    placed: Array.isArray(shop.placed)
      ? shop.placed.map((item, index) =>
          normalizePlacedItem(
            {
              ...item,
              scale:
                typeof item.scale === 'number'
                  ? item.scale
                  : DEFAULT_ITEM_SCALE,
            },
            index + 1
          )
        )
      : [],
    itemStates: shop.itemStates || {},
  };

  await saveShopAll(all);
}

// =============================
// 📌 [10] 출석 / 보상 유틸
// =============================
async function rewardAttendanceDrops(userId, dateKey) {
  const todayKey = formatDateKey(new Date());

  // 오늘 날짜만 물방울 지급
  if (dateKey !== todayKey) return false;

  const tree = await loadTree(userId);
  if (tree.lastAttendanceRewardDate === dateKey) return false;

  const next = {
    ...tree,
    droplets: (tree.droplets || 0) + 5,
    lastAttendanceRewardDate: dateKey,
  };

  await saveTree(userId, next);
  return true;
}

async function markAttendanceForUser(userId, dateKey) {
  const todayKey = formatDateKey(new Date());

  // 오늘 날짜 일기만 출석 처리
  if (dateKey !== todayKey) return false;

  const allAttendance = await loadAttendance();
  const myAttendance = allAttendance[userId] || {};

  if (myAttendance[dateKey]) return false;

  const next = {
    ...allAttendance,
    [userId]: {
      ...myAttendance,
      [dateKey]: { checkedAt: Date.now(), source: 'diary' },
    },
  };

  await saveAttendance(next);
  await rewardAttendanceDrops(userId, dateKey);
  return true;
}

// =============================
// 📌 [11] 드래그 가능한 정원 아이템
// =============================
function DraggableGardenItem({ item, isSelected, onMoveEnd, onSelect }) {
  const iconInfo = SHOP_ITEMS.find((shopItem) => shopItem.id === item.id);

  const startX = typeof item.x === 'number' ? item.x : 0;
  const startY = typeof item.y === 'number' ? item.y : 100;

  const pan = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const lastOffset = useRef({ x: startX, y: startY });

  useEffect(() => {
    const nextX = typeof item.x === 'number' ? item.x : 0;
    const nextY = typeof item.y === 'number' ? item.y : 100;

    pan.setValue({ x: nextX, y: nextY });
    lastOffset.current = { x: nextX, y: nextY };
  }, [item.x, item.y]);

  const clampPosition = (x, y) => {
    const minX = 0;
    const maxX = 240;
    const minY = 80;
    const maxY = 235;

    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        onSelect?.(item.id);
        pan.setOffset(lastOffset.current);
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();

        const rawX = lastOffset.current.x + gesture.dx;
        const rawY = lastOffset.current.y + gesture.dy;
        const next = clampPosition(rawX, rawY);

        pan.setValue({ x: next.x, y: next.y });
        lastOffset.current = { x: next.x, y: next.y };

        onMoveEnd?.(item.id, next.x, next.y);
      },

      onPanResponderTerminate: () => {
        pan.flattenOffset();
        pan.setValue({
          x: lastOffset.current.x,
          y: lastOffset.current.y,
        });
      },
    })
  ).current;

  if (!iconInfo) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.gardenDragItem,
        {
          zIndex: item.zIndex ?? 1,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: item.scale ?? DEFAULT_ITEM_SCALE },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onSelect?.(item.id)}
        style={[
          styles.gardenItemTouch,
          isSelected && styles.gardenItemSelected,
        ]}
      >
        <Text style={styles.gardenDragEmoji}>{iconInfo.icon}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// =============================
// 📌 [12] SplashScreen
// =============================
// =============================
// 📌 [12] SplashScreen (부드러운 인트로 버전)
// =============================
function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 👉 서서히 등장
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),

      // 👉 화면 유지 (핵심)
      Animated.delay(1500),

      // 👉 서서히 사라짐
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) onFinish(); // 다음 화면 이동
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden />

      <Animated.Image
        source={require('./splash.png')}
        style={{
          width: '100%',
          height: '100%',
          opacity: fadeAnim,
        }}
        resizeMode="cover"
      />
    </View>
  );
}

// =============================
// 📌 [13] AuthScreen
// =============================
function AuthScreen({ onLogin }) {
  const { theme } = useAppTheme();

  const [mode, setMode] = useState('login');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [findKeyword, setFindKeyword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setUserId('');
    setPassword('');
    setSignupEmail('');
    setSignupPhone('');
    setFindKeyword('');
    setShowPassword(false);
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    resetForm();
  };

  const handleLocalAuth = async () => {
    const id = userId.trim();
    const pw = password.trim();
    const email = signupEmail.trim();
    const phone = signupPhone.trim();
    const users = await loadUsers();

    if (mode === 'login') {
      if (!id || !pw) {
        Alert.alert('알림', '아이디와 비밀번호를 입력해주세요.');
        return;
      }

      if (users[id] && users[id].password === pw) {
        await AsyncStorage.setItem(STORAGE_KEYS.autoLogin, id);
        onLogin(id);
      } else {
        Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
      }

      return;
    }

    if (mode === 'signup') {
      if (!id || !pw) {
        Alert.alert('알림', '아이디와 비밀번호를 입력해주세요.');
        return;
      }

      if (!email && !phone) {
        Alert.alert('알림', '이메일 또는 전화번호를 하나 이상 입력해주세요.');
        return;
      }

      if (users[id]) {
        Alert.alert('회원가입 실패', '이미 존재하는 아이디입니다.');
        return;
      }

      const duplicatedContact = Object.values(users).find(
        (item) =>
          (email && item.email && item.email === email) ||
          (phone && item.phone && item.phone === phone)
      );

      if (duplicatedContact) {
        Alert.alert('회원가입 실패', '이미 사용 중인 이메일 또는 전화번호입니다.');
        return;
      }

      users[id] = {
        id,
        password: pw,
        email,
        phone,
        provider: 'local',
        createdAt: Date.now(),
      };

      await saveUsers(users);
      await saveProfile(id, {
        nickname: id,
        avatar: '👤',
        photoUri: '',
      });

      Alert.alert('완료', '회원가입이 완료되었습니다. 로그인해주세요.');
      changeMode('login');
    }
  };

  const handleFindId = async () => {
    const keyword = findKeyword.trim();
    const users = await loadUsers();

    if (!keyword) {
      Alert.alert('알림', '이메일 또는 전화번호를 입력해주세요.');
      return;
    }

    const found = Object.values(users).find(
      (item) => item.email === keyword || item.phone === keyword
    );

    if (!found) {
      Alert.alert('아이디 찾기', '일치하는 계정을 찾지 못했어요.');
      return;
    }

    Alert.alert('아이디 찾기', `찾은 아이디는 "${found.id}" 입니다.`);
  };

  const handleFindPw = async () => {
    const id = userId.trim();
    const users = await loadUsers();

    if (!id) {
      Alert.alert('알림', '비밀번호를 찾을 아이디를 입력해주세요.');
      return;
    }

    if (!users[id]) {
      Alert.alert('조회 결과', '존재하지 않는 아이디입니다.');
      return;
    }

    Alert.alert('비밀번호 찾기', `"${id}"의 비밀번호는 "${users[id].password}" 입니다.`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.authWrap}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.loginHero, { borderColor: theme.border }]}>
            <Text style={styles.loginLogo}>🌿</Text>

            <Text style={[styles.loginTitle, { color: theme.text }]}>
              마음 정원
            </Text>

            <Text style={[styles.loginSub, { color: theme.sub }]}>
              바람처럼 천천히, 하루를 기록해보세요
            </Text>
          </View>

          <View style={styles.authTextTabs}>
            <TouchableOpacity onPress={() => changeMode('login')}>
              <Text
                style={[
                  styles.authTextTab,
                  { color: theme.sub },
                  mode === 'login' && styles.authTextTabActive,
                  mode === 'login' && { color: theme.primaryDeep },
                ]}
              >
                로그인
              </Text>
            </TouchableOpacity>

            <Text style={styles.authDivider}>|</Text>

            <TouchableOpacity onPress={() => changeMode('signup')}>
              <Text
                style={[
                  styles.authTextTab,
                  { color: theme.sub },
                  mode === 'signup' && styles.authTextTabActive,
                  mode === 'signup' && { color: theme.primaryDeep },
                ]}
              >
                회원가입
              </Text>
            </TouchableOpacity>

            <Text style={styles.authDivider}>|</Text>

            <TouchableOpacity onPress={() => changeMode('findId')}>
              <Text
                style={[
                  styles.authTextTab,
                  { color: theme.sub },
                  mode === 'findId' && styles.authTextTabActive,
                  mode === 'findId' && { color: theme.primaryDeep },
                ]}
              >
                아이디 찾기
              </Text>
            </TouchableOpacity>

            <Text style={styles.authDivider}>|</Text>

            <TouchableOpacity onPress={() => changeMode('findPw')}>
              <Text
                style={[
                  styles.authTextTab,
                  { color: theme.sub },
                  mode === 'findPw' && styles.authTextTabActive,
                  mode === 'findPw' && { color: theme.primaryDeep },
                ]}
              >
                비밀번호 찾기
              </Text>
            </TouchableOpacity>
          </View>

          {(mode === 'login' || mode === 'signup' || mode === 'findPw') && (
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text },
              ]}
              placeholder="아이디"
              placeholderTextColor={theme.sub}
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
            />
          )}

          {(mode === 'login' || mode === 'signup') && (
            <View
              style={[
                styles.passwordInputWrap,
                {
                  borderColor: theme.border,
                  backgroundColor: '#FFFFFF',
                },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: theme.text }]}
                placeholder="비밀번호"
                placeholderTextColor={theme.sub}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[
                  styles.passwordToggleBtn,
                  { borderColor: theme.border },
                ]}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.passwordToggleBtnText,
                    { color: theme.primaryDeep },
                  ]}
                >
                  {showPassword ? '숨김' : '보기'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'signup' && (
            <>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.text },
                ]}
                placeholder="이메일 (아이디 찾기에 사용)"
                placeholderTextColor={theme.sub}
                value={signupEmail}
                onChangeText={setSignupEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.text },
                ]}
                placeholder="전화번호 (아이디 찾기에 사용)"
                placeholderTextColor={theme.sub}
                value={signupPhone}
                onChangeText={setSignupPhone}
                keyboardType="phone-pad"
              />
            </>
          )}

          {mode === 'findId' && (
            <>
              <View
                style={[
                  styles.authHelperBox,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.card,
                  },
                ]}
              >
                <Text style={[styles.authHelperText, { color: theme.sub }]}>
                  회원가입 때 입력한 이메일이나 전화번호로 아이디를 찾습니다.
                </Text>
              </View>

              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.text },
                ]}
                placeholder="이메일 또는 전화번호"
                placeholderTextColor={theme.sub}
                value={findKeyword}
                onChangeText={setFindKeyword}
                autoCapitalize="none"
              />
            </>
          )}

          {mode === 'findPw' && (
            <View
              style={[
                styles.authHelperBox,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                },
              ]}
            >
              <Text style={[styles.authHelperText, { color: theme.sub }]}>
                현재는 로컬 저장 방식이라 아이디 입력 후 비밀번호 확인이 가능합니다.
              </Text>
            </View>
          )}

          {mode === 'login' && (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleLocalAuth}
            >
              <Text style={styles.primaryBtnText}>정원으로 들어가기</Text>
            </TouchableOpacity>
          )}

          {mode === 'signup' && (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleLocalAuth}
            >
              <Text style={styles.primaryBtnText}>새 기록장 만들기</Text>
            </TouchableOpacity>
          )}

          {mode === 'findId' && (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleFindId}
            >
              <Text style={styles.primaryBtnText}>아이디 찾기</Text>
            </TouchableOpacity>
          )}

          {mode === 'findPw' && (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleFindPw}
            >
              <Text style={styles.primaryBtnText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =============================
// 📌 [14] HomeMainScreen
// =============================
function HomeMainScreen({ navigation, route }) {
  const { theme } = useAppTheme();
  const { userId } = route.params;

  const [profile, setProfileState] = useState({
    nickname: userId,
    avatar: '👤',
    photoUri: '',
  });

  const [tree, setTreeState] = useState({
    droplets: 0,
    waterCount: 0,
    fruits: 0,
    lastAttendanceRewardDate: '',
  });

  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [hasTodayDiary, setHasTodayDiary] = useState(false);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState('');

  const loadWeather = async (savedSettings) => {
    if (!savedSettings.weatherEnabled) {
      setWeather(null);
      setWeatherError('');
      setWeatherLocation('');
      return;
    }

    try {
      setWeatherLoading(true);
      setWeatherError('');

      const coords = await getCurrentCoordsForWeather();
      const latitude = coords.latitude;
      const longitude = coords.longitude;

      const weatherData = await fetchWeatherByCoords(latitude, longitude);
      setWeather(weatherData);

      if (IS_WEB) {
        setWeatherLocation('');
        return;
      }

      try {
        const place = await Location.reverseGeocodeAsync({ latitude, longitude });
        const first = place?.[0];
        const label =
          first?.district || first?.subregion || first?.city || first?.region || '';
        setWeatherLocation(label);
      } catch {
        setWeatherLocation('');
      }
    } catch (error) {
      if (error.message === 'permission-denied') {
        setWeatherError('위치 권한이 없어 날씨를 불러올 수 없어요.');
      } else if (error.message === 'location-disabled') {
        setWeatherError('위치 서비스가 꺼져 있어요.');
      } else if (error.message === 'geolocation-not-supported') {
        setWeatherError('이 브라우저에서는 위치 기능을 지원하지 않아요.');
      } else {
        setWeatherError('날씨 정보를 불러오지 못했어요.');
      }

      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadHome = async () => {
    const loadedProfile = await loadProfile(userId);
    const loadedTree = await loadTree(userId);
    const loadedSettings = await loadSettings();

    const todayKey = formatDateKey(new Date());
    const allDiaries = await loadDiaries();

    const todayDiaryExists = allDiaries.some(
      (d) => d.userId === userId && d.dateKey === todayKey
    );

    setProfileState(loadedProfile);
    setTreeState(loadedTree);
    setSettingsState(loadedSettings);
    setHasTodayDiary(todayDiaryExists);

    await loadWeather(loadedSettings);
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadHome);
    loadHome();
    return unsub;
  }, [navigation, userId]);

  const waterTree = async () => {
    const current = await loadTree(userId);

    if ((current.droplets || 0) < 1) {
      Alert.alert('안내', '오늘의 마음을 기록하면 물을 줄 수 있어요 🌿');
      return;
    }

    const nextWaterCount = (current.waterCount || 0) + 1;
    let nextFruit = current.fruits || 0;

    if (nextWaterCount % 50 === 0) {
      nextFruit += 1;
    }

    const next = {
      ...current,
      droplets: (current.droplets || 0) - 1,
      waterCount: nextWaterCount,
      fruits: nextFruit,
    };

    await saveTree(userId, next);
    setTreeState(next);

    if (nextWaterCount % 50 === 0) {
      Alert.alert('열매 획득', `물을 ${nextWaterCount}번 주어 열매 1개가 열렸어요 🍎`);
    }
  };

  const progressToNextFruit = tree.waterCount % 50;

  const remainingToNextFruit =
    progressToNextFruit === 0 && tree.waterCount !== 0
      ? 0
      : 50 - progressToNextFruit;

  const weatherCardTheme = weather
    ? getWeatherCardTheme(weather.weatherCode, weather.isDay, theme)
    : null;

  return (
    <SafeAreaView style={[styles.homeSafeArea, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={styles.homeContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeTitleWrap}>
          <View style={styles.homeTitleRow}>
            <Text style={[styles.homeTitle, { color: theme.text }]}>🌿 마음 정원</Text>

            <View style={styles.homeTopStatusWrap}>
              <View
                style={[
                  styles.homeTopStatusPill,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text style={styles.treeStatusEmoji}>💧</Text>
                <Text style={styles.treeStatusValue}>{tree.droplets}</Text>
              </View>

              <View
                style={[
                  styles.homeTopStatusPill,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text style={styles.treeStatusEmoji}>🍎</Text>
                <Text style={styles.treeStatusValue}>{tree.fruits}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.homeGreeting, { color: theme.primaryDeep }]}>
            오늘도 잘 왔어요, {profile.nickname || userId}
          </Text>

          <Text style={[styles.homeSubtitle, { color: theme.sub }]}>
            나무를 눌러 물을 주고, 천천히 정원을 키워보세요
          </Text>
        </View>

        {settings.reminderBannerEnabled !== false && !hasTodayDiary && (
          <TouchableOpacity
            style={[
              styles.reminderBanner,
              {
                backgroundColor: theme.greenMint,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('DiaryWrite', {
                dateKey: formatDateKey(new Date()),
                userId,
              })
            }
          >
            <Text style={styles.reminderBannerEmoji}>🌿</Text>

            <View style={{ flex: 1 }}>
              <Text style={[styles.reminderBannerTitle, { color: theme.text }]}>
                오늘의 마음을 아직 남기지 않았어요
              </Text>

              <Text style={[styles.reminderBannerText, { color: theme.sub }]}>
                {settings.notificationMessage || DEFAULT_SETTINGS.notificationMessage}
              </Text>
            </View>

            <Text style={[styles.reminderBannerArrow, { color: theme.primaryDeep }]}>
              〉
            </Text>
          </TouchableOpacity>
        )}

        <View style={[styles.treeCard, { borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle2, { color: theme.text }]}>🌳 나의 나무</Text>

          <Text style={[styles.treeInfoText, { color: theme.sub }]}>
            물방울을 사용해 나무를 키우고, 50번마다 열매를 얻어요
          </Text>

          <View
            style={[
              styles.smallWaterCard,
              { backgroundColor: theme.greenMint, borderColor: theme.border },
            ]}
          >
            <Text style={styles.smallWaterEmoji}>🌱</Text>

            <Text style={[styles.smallWaterLabel, { color: theme.sub }]}>물 준 횟수</Text>

            <Text style={[styles.smallWaterValue, { color: theme.primaryDeep }]}>
              {tree.waterCount}회
            </Text>

            <Text style={[styles.smallWaterNextText, { color: theme.primaryDeep }]}>
              다음 열매까지 {remainingToNextFruit}번
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.88} onPress={waterTree} style={styles.treeTouchWrap}>
            <View
              style={[
                styles.treePreviewBox,
                { backgroundColor: theme.greenMint, borderColor: theme.border },
              ]}
            >
              <Text style={styles.treeEmoji}>{getTreeEmoji(tree.waterCount)}</Text>
              <Text style={[styles.treeTapGuide, { color: theme.primaryDeep }]}>
                나무를 눌러 물 주기
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Garden', { userId })}
          >
            <Text style={styles.primaryBtnText}>🌿 나의 정원 가기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.yellow, marginTop: 10 }]}
            onPress={() => navigation.navigate('Shop', { userId })}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
              🛍️ 정원 상점 가기
            </Text>
          </TouchableOpacity>
        </View>

        {settings.weatherEnabled && (
          <View
            style={[
              styles.cardBox,
              {
                borderColor: weatherCardTheme?.accent || theme.border,
                marginTop: 14,
                backgroundColor: weatherCardTheme?.bg || theme.card,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle2,
                {
                  color: weatherCardTheme?.accent || theme.text,
                  marginTop: 0,
                },
              ]}
            >
              🌤️ 오늘의 날씨
            </Text>

            {weatherLoading ? (
              <Text style={{ color: theme.sub, marginTop: 8 }}>
                날씨를 불러오는 중이에요...
              </Text>
            ) : weatherError ? (
              <Text style={{ color: theme.red, marginTop: 8 }}>{weatherError}</Text>
            ) : weather ? (
              <View style={{ marginTop: 8 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ fontSize: 30 }}>{weather.weatherEmoji}</Text>

                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 20,
                        fontWeight: '800',
                        marginTop: 4,
                      }}
                    >
                      {weather.temperature}°C
                    </Text>

                    <Text
                      style={{
                        color: weatherCardTheme?.accent || theme.primaryDeep,
                        fontSize: 14,
                        fontWeight: '700',
                        marginTop: 5,
                      }}
                    >
                      {weatherCardTheme?.title || weather.weatherText}
                    </Text>

                    <Text style={{ color: theme.sub, marginTop: 3 }}>
                      {weather.weatherText}
                      {weatherLocation ? ` · ${weatherLocation}` : ''}
                    </Text>

                    <Text style={{ color: theme.sub, marginTop: 1 }}>
                      체감 {weather.apparentTemperature}°C
                    </Text>
                  </View>

                  <View
                    style={{
                      minWidth: 60,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 14,
                      backgroundColor: weatherCardTheme?.chipBg || theme.greenLight,
                    }}
                  >
                    <Text
                      style={{
                        color: weatherCardTheme?.accent || theme.primaryDeep,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      {weather.isDay ? '낮 공기' : '밤 공기'}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: theme.greenMint,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text style={{ color: theme.text, lineHeight: 20 }}>
                    {weatherCardTheme?.message ||
                      '오늘의 하늘 아래 마음도 천천히 기록해보세요.'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.secondaryBtn,
                    {
                      backgroundColor: weatherCardTheme?.chipBg || theme.greenLight,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: weatherCardTheme?.accent || theme.border,
                    },
                  ]}
                  onPress={() => loadWeather(settings)}
                >
                  <Text
                    style={[
                      styles.secondaryBtnText,
                      { color: weatherCardTheme?.accent || theme.text },
                    ]}
                  >
                    날씨 새로고침
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={{ color: theme.sub, marginTop: 8 }}>
                표시할 날씨 정보가 없어요.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================
// 📌 [14-1] GardenScreen
// =============================
function GardenScreen({ navigation, route }) {
  const { theme } = useAppTheme();
  const { userId } = route.params;

  const [tree, setTreeState] = useState({
    droplets: 0,
    waterCount: 0,
    fruits: 0,
    lastAttendanceRewardDate: '',
  });

  const [shop, setShopState] = useState({
    owned: [],
    placed: [],
    itemStates: {},
  });

  const shopRef = useRef({
    owned: [],
    placed: [],
    itemStates: {},
  });

  const [selectedItemId, setSelectedItemId] = useState(null);

  const loadGarden = async () => {
    const loadedTree = await loadTree(userId);
    const loadedShop = await loadShop(userId);

    setTreeState(loadedTree);
    setShopState(loadedShop);
    shopRef.current = loadedShop;

    if (selectedItemId) {
      const stillPlaced = (loadedShop.placed || []).some(
        (item) => item.id === selectedItemId
      );
      if (!stillPlaced) setSelectedItemId(null);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadGarden);
    loadGarden();
    return unsub;
  }, [navigation, userId]);

  const handleMoveEnd = async (itemId, newX, newY) => {
    const currentShop = shopRef.current || { owned: [], placed: [], itemStates: {} };
    const target = (currentShop.placed || []).find((item) => item.id === itemId);
    if (!target) return;

    const movedItem = normalizePlacedItem(
      {
        ...target,
        x: newX,
        y: newY,
        scale: target.scale ?? DEFAULT_ITEM_SCALE,
        zIndex: target.zIndex ?? 1,
      },
      target.zIndex ?? 1
    );

    const nextPlaced = (currentShop.placed || []).map((item, index) =>
      item.id === itemId
        ? movedItem
        : normalizePlacedItem(item, item.zIndex ?? index + 1)
    );

    const nextShop = {
      ...currentShop,
      placed: nextPlaced,
      itemStates: {
        ...(currentShop.itemStates || {}),
        [itemId]: {
          x: movedItem.x,
          y: movedItem.y,
          scale: movedItem.scale,
          zIndex: movedItem.zIndex,
        },
      },
    };

    shopRef.current = nextShop;
    setShopState(nextShop);
    await saveShop(userId, nextShop);
  };

  const updateSelectedItem = async (updater) => {
    if (!selectedItemId) return;

    const currentShop = shopRef.current || { owned: [], placed: [], itemStates: {} };
    const target = (currentShop.placed || []).find((item) => item.id === selectedItemId);
    if (!target) return;

    const updatedTarget = normalizePlacedItem(
      updater({
        ...target,
        scale: target.scale ?? DEFAULT_ITEM_SCALE,
        zIndex: target.zIndex ?? 1,
      }),
      target.zIndex ?? 1
    );

    const nextPlaced = (currentShop.placed || []).map((item, index) =>
      item.id === selectedItemId
        ? updatedTarget
        : normalizePlacedItem(item, item.zIndex ?? index + 1)
    );

    const nextShop = {
      ...currentShop,
      placed: nextPlaced,
      itemStates: {
        ...(currentShop.itemStates || {}),
        [selectedItemId]: {
          x: updatedTarget.x,
          y: updatedTarget.y,
          scale: updatedTarget.scale,
          zIndex: updatedTarget.zIndex,
        },
      },
    };

    shopRef.current = nextShop;
    setShopState(nextShop);
    await saveShop(userId, nextShop);
  };

  const persistPlacedOrder = async (placedList) => {
    const currentShop = shopRef.current || { owned: [], placed: [], itemStates: {} };

    const normalized = [...placedList]
      .map((item, index) => normalizePlacedItem(item, item.zIndex ?? index + 1))
      .sort((a, b) => a.zIndex - b.zIndex);

    const nextStates = { ...(currentShop.itemStates || {}) };

    normalized.forEach((item) => {
      nextStates[item.id] = {
        x: item.x,
        y: item.y,
        scale: item.scale,
        zIndex: item.zIndex,
      };
    });

    const nextShop = {
      ...currentShop,
      placed: normalized,
      itemStates: nextStates,
    };

    shopRef.current = nextShop;
    setShopState(nextShop);
    await saveShop(userId, nextShop);
  };

  const bringForward = async () => {
    const currentPlaced = [...(shopRef.current.placed || [])].sort(
      (a, b) => a.zIndex - b.zIndex
    );
    const targetIndex = currentPlaced.findIndex(
      (item) => item.id === selectedItemId
    );
    if (targetIndex === -1 || targetIndex === currentPlaced.length - 1) return;

    const swapped = currentPlaced.map((item) => ({ ...item }));
    const current = swapped[targetIndex];
    const next = swapped[targetIndex + 1];

    const currentZ = current.zIndex;
    current.zIndex = next.zIndex;
    next.zIndex = currentZ;

    await persistPlacedOrder(swapped);
  };

  const sendBackward = async () => {
    const currentPlaced = [...(shopRef.current.placed || [])].sort(
      (a, b) => a.zIndex - b.zIndex
    );
    const targetIndex = currentPlaced.findIndex(
      (item) => item.id === selectedItemId
    );
    if (targetIndex <= 0) return;

    const swapped = currentPlaced.map((item) => ({ ...item }));
    const current = swapped[targetIndex];
    const prev = swapped[targetIndex - 1];

    const currentZ = current.zIndex;
    current.zIndex = prev.zIndex;
    prev.zIndex = currentZ;

    await persistPlacedOrder(swapped);
  };

  const selectedItem = (shop.placed || []).find(
    (item) => item.id === selectedItemId
  );
  const placedItems = [...(shop.placed || [])].sort(
    (a, b) => a.zIndex - b.zIndex
  );

  return (
  <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
    <ScrollView
      contentContainerStyle={[
        styles.gardenScreenWrap,
        { paddingBottom: 110 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: theme.text }]}>🌿 나의 정원</Text>
      <Text style={[styles.screenSub, { color: theme.sub }]}>
        아이템을 끌어서 원하는 위치에 놓아보세요
      </Text>

      <View
        style={[
          styles.gardenHeaderCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.gardenHeaderText, { color: theme.text }]}>
          배치한 아이템 {(shop.placed || []).length}개
        </Text>
        <Text style={[styles.gardenHeaderSubText, { color: theme.sub }]}>
          자유롭게 꾸며보세요
        </Text>
      </View>

      <TouchableWithoutFeedback onPress={() => setSelectedItemId(null)}>
        <View
          style={[
            styles.gardenOnlyBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.gardenSky} />
          <View style={styles.gardenMountainLeft} />
          <View style={styles.gardenMountainRight} />
          <View style={styles.gardenField} />
          <View style={styles.gardenGroundStroke} />
          <Text style={styles.gardenTree}>{getTreeEmoji(tree.waterCount)}</Text>

          {placedItems.map((item) => (
            <DraggableGardenItem
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onMoveEnd={handleMoveEnd}
              onSelect={setSelectedItemId}
            />
          ))}
        </View>
      </TouchableWithoutFeedback>

      {selectedItem && (
        <View style={styles.editBar}>
          <TouchableOpacity
            style={styles.editBarBtn}
            onPress={() =>
              updateSelectedItem((item) => ({
                ...item,
                scale: clamp(
                  (item.scale ?? DEFAULT_ITEM_SCALE) - 0.1,
                  MIN_ITEM_SCALE,
                  MAX_ITEM_SCALE
                ),
              }))
            }
          >
            <Text style={styles.editBarBtnText}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editBarBtn}
            onPress={() =>
              updateSelectedItem((item) => ({
                ...item,
                scale: clamp(
                  (item.scale ?? DEFAULT_ITEM_SCALE) + 0.1,
                  MIN_ITEM_SCALE,
                  MAX_ITEM_SCALE
                ),
              }))
            }
          >
            <Text style={styles.editBarBtnText}>＋</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editBarBtn} onPress={sendBackward}>
            <Text style={styles.editBarBtnText}>↓</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editBarBtn} onPress={bringForward}>
            <Text style={styles.editBarBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          styles.gardenShopBtn,
          { backgroundColor: theme.primary },
        ]}
        onPress={() => navigation.navigate('Shop', { userId })}
      >
        <Text style={styles.primaryBtnText}>🛍️ 상점에서 더 꾸미기</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);
}

// =============================
// 📌 [15] ShopScreen
// =============================
function ShopScreen({ route, navigation }) {
  const { theme } = useAppTheme();
  const { userId } = route.params;

  const [tree, setTreeState] = useState({
    droplets: 0,
    waterCount: 0,
    fruits: 0,
    lastAttendanceRewardDate: '',
  });

  const [shop, setShopState] = useState({
    owned: [],
    placed: [],
    itemStates: {},
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  const CATEGORY_OPTIONS = [
    { key: 'all', label: '전체' },
    { key: 'plant', label: '식물' },
    { key: 'animal', label: '동물' },
    { key: 'furniture', label: '가구' },
    { key: 'decor', label: '장식' },
  ];

  const MAX_PLACED_ITEMS = 12;

  const loadShopData = async () => {
    const loadedTree = await loadTree(userId);
    const loadedShop = await loadShop(userId);

    setTreeState(loadedTree);
    setShopState(loadedShop);
  };

  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', loadShopData);
    loadShopData();
    return unsub;
  }, [navigation, userId]);

  const isUnlocked = (item, waterCount) => {
    if (item.id === 'mushroom') return waterCount >= 10;
    if (item.id === 'fountain') return waterCount >= 30;
    if (item.id === 'squirrel') return waterCount >= 50;
    if (item.id === 'lanternTree') return waterCount >= 70;
    return true;
  };

  const getUnlockText = (item) => {
    if (item.id === 'mushroom') return '물 10번 이상 주면 열려요';
    if (item.id === 'fountain') return '물 30번 이상 주면 열려요';
    if (item.id === 'squirrel') return '물 50번 이상 주면 열려요';
    if (item.id === 'lanternTree') return '물 70번 이상 주면 열려요';
    return '';
  };

  const alreadyPlaced = (itemId, placedList) => {
    return (placedList || []).some((item) => item.id === itemId);
  };

  const getMaxZIndex = (placedList) => {
    if (!placedList || placedList.length === 0) return 1;
    return Math.max(...placedList.map((item) => item.zIndex || 1));
  };

  const getDefaultPosition = (placedList) => {
    const index = (placedList || []).length;

    const positions = [
      { x: 20, y: 95 },
      { x: 85, y: 95 },
      { x: 150, y: 95 },
      { x: 215, y: 95 },

      { x: 30, y: 145 },
      { x: 95, y: 145 },
      { x: 160, y: 145 },
      { x: 225, y: 145 },

      { x: 45, y: 195 },
      { x: 110, y: 195 },
      { x: 175, y: 195 },
      { x: 240, y: 195 },
    ];

    return positions[index] || { x: 40, y: 120 };
  };

  const buyItem = async (item) => {
    const currentTree = await loadTree(userId);
    const currentShop = await loadShop(userId);

    if (!isUnlocked(item, currentTree.waterCount || 0)) {
      Alert.alert('잠금 상태', getUnlockText(item));
      return;
    }

    if ((currentShop.owned || []).includes(item.id)) {
      Alert.alert('안내', '이미 구매한 아이템이에요.');
      return;
    }

    if ((currentTree.fruits || 0) < item.price) {
      Alert.alert('안내', `열매가 부족해요. 필요한 열매: ${item.price}개`);
      return;
    }

    const nextTree = {
      ...currentTree,
      fruits: (currentTree.fruits || 0) - item.price,
    };

    const nextShop = {
      ...currentShop,
      owned: [...(currentShop.owned || []), item.id],
      placed: currentShop.placed || [],
      itemStates: currentShop.itemStates || {},
    };

    await saveTree(userId, nextTree);
    await saveShop(userId, nextShop);

    setTreeState(nextTree);
    setShopState(nextShop);

    Alert.alert('구매 완료', `${item.name}을(를) 구매했어요.`);
  };

  const placeItem = async (itemId) => {
    const currentShop = await loadShop(userId);

    if (!(currentShop.owned || []).includes(itemId)) return;

    if (alreadyPlaced(itemId, currentShop.placed)) {
      Alert.alert('안내', '이미 정원에 놓여 있어요.');
      return;
    }

    if ((currentShop.placed || []).length >= MAX_PLACED_ITEMS) {
      Alert.alert('안내', `정원에는 최대 ${MAX_PLACED_ITEMS}개까지만 놓을 수 있어요.`);
      return;
    }

    const savedState = currentShop.itemStates?.[itemId];
    const defaultPos = getDefaultPosition(currentShop.placed);
    const maxZ = getMaxZIndex(currentShop.placed);

    const nextItem = normalizePlacedItem(
      {
        id: itemId,
        x:
          savedState && typeof savedState.x === 'number'
            ? savedState.x
            : defaultPos.x,
        y:
          savedState && typeof savedState.y === 'number'
            ? savedState.y
            : defaultPos.y,
        scale:
          savedState && typeof savedState.scale === 'number'
            ? savedState.scale
            : DEFAULT_ITEM_SCALE,
        zIndex:
          savedState && typeof savedState.zIndex === 'number'
            ? Math.max(savedState.zIndex, maxZ + 1)
            : maxZ + 1,
      },
      maxZ + 1
    );

    const nextShop = {
      ...currentShop,
      placed: [...(currentShop.placed || []), nextItem],
      itemStates: {
        ...(currentShop.itemStates || {}),
        [itemId]: {
          x: nextItem.x,
          y: nextItem.y,
          scale: nextItem.scale,
          zIndex: nextItem.zIndex,
        },
      },
    };

    await saveShop(userId, nextShop);
    setShopState(nextShop);
    Alert.alert('배치 완료', '정원에 아이템을 놓았어요. 정원에서 위치와 크기를 조절할 수 있어요.');
  };

  const removeItemFromGarden = async (itemId) => {
    const currentShop = await loadShop(userId);
    const target = (currentShop.placed || []).find((item) => item.id === itemId);

    const nextShop = {
      ...currentShop,
      placed: (currentShop.placed || []).filter((item) => item.id !== itemId),
      itemStates: {
        ...(currentShop.itemStates || {}),
        ...(target
          ? {
              [itemId]: {
                x: target.x,
                y: target.y,
                scale:
                  typeof target.scale === 'number'
                    ? target.scale
                    : DEFAULT_ITEM_SCALE,
                zIndex: typeof target.zIndex === 'number' ? target.zIndex : 1,
              },
            }
          : {}),
      },
    };

    await saveShop(userId, nextShop);
    setShopState(nextShop);
    Alert.alert('보관 완료', '아이템을 창고에 넣었어요.');
  };

  const filteredItems =
    selectedCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === selectedCategory);

  const recommendedItems = useMemo(() => {
    const waterCount = tree.waterCount || 0;
    const fruits = tree.fruits || 0;
    const owned = shop.owned || [];
    const placed = shop.placed || [];

    const candidates = SHOP_ITEMS.filter(
      (item) => !owned.includes(item.id) && isUnlocked(item, waterCount)
    );

    const scored = candidates.map((item) => {
      let score = 0;

      if (item.price <= fruits) score += 3;
      if (item.category === 'plant' && waterCount < 20) score += 2;
      if (item.category === 'decor' && waterCount >= 20) score += 2;
      if (item.category === 'animal' && waterCount >= 35) score += 2;
      if (item.category === 'furniture' && placed.length >= 2) score += 1;
      if (item.price === 1) score += 1;

      return { ...item, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [tree, shop]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>🛍️ 정원 상점</Text>
        <Text style={[styles.screenSub, { color: theme.sub }]}>
          열매로 아이템을 사고, 정원에 꺼내서 직접 배치해보세요
        </Text>

        <View
          style={[
            styles.shopSummaryCard,
            { borderColor: theme.border, backgroundColor: theme.card },
          ]}
        >
          <View style={styles.shopSummaryRow}>
            <Text style={[styles.shopSummaryText, { color: theme.text }]}>
              🍎 보유 열매 {tree.fruits}개
            </Text>
            <Text style={[styles.shopSummaryText, { color: theme.sub }]}>
              🌿 배치 중 {(shop.placed || []).length}개
            </Text>
          </View>
        </View>

        {recommendedItems.length > 0 && (
          <View style={[styles.cardBox, { borderColor: theme.border, marginTop: 14 }]}>
            <Text style={[styles.sectionTitle2, { color: theme.text, marginTop: 0 }]}>
              🌟 추천 아이템
            </Text>
            <Text style={[styles.screenSub, { color: theme.sub, marginTop: 6 }]}>
              지금 정원 분위기에 어울리는 아이템들이야
            </Text>

            <View style={{ marginTop: 12 }}>
              {recommendedItems.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.recommendRow,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.greenMint,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 28, marginRight: 10 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.shopName, { color: theme.text, marginTop: 0 }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.shopPrice, { color: theme.sub }]}>
                        열매 {item.price}개
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.recommendBuyBtn, { backgroundColor: theme.primary }]}
                    onPress={() => buyItem(item)}
                  >
                    <Text style={styles.buyBtnText}>구매</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={true}
  style={styles.horizontalScrollBox}
  contentContainerStyle={styles.categoryScrollContent}
>
  {CATEGORY_OPTIONS.map((category) => {
    const selected = selectedCategory === category.key;

    return (
      <TouchableOpacity
        key={category.key}
        style={[
          styles.categoryChip,
          {
            backgroundColor: selected ? theme.primary : theme.card,
            borderColor: selected ? theme.primary : theme.border,
          },
        ]}
        onPress={() => setSelectedCategory(category.key)}
      >
        <Text
          style={[styles.categoryChipText, { color: selected ? '#FFF' : theme.text }]}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  })}
</ScrollView>

        <View style={styles.shopGrid}>
          {filteredItems.map((item) => {
            const owned = (shop.owned || []).includes(item.id);
            const placed = alreadyPlaced(item.id, shop.placed);
            const unlocked = isUnlocked(item, tree.waterCount || 0);

            let buttonLabel = '구매';
            let buttonAction = () => buyItem(item);
            let buttonColor = theme.primary;

            if (owned && !placed) {
              buttonLabel = '정원에 놓기';
              buttonAction = () => placeItem(item.id);
              buttonColor = theme.primaryDeep;
            }

            if (owned && placed) {
              buttonLabel = '창고에 넣기';
              buttonAction = () => removeItemFromGarden(item.id);
              buttonColor = theme.softBrown;
            }

            if (!unlocked) {
              buttonLabel = '잠김';
              buttonAction = () => Alert.alert('잠금 상태', getUnlockText(item));
              buttonColor = '#BFCABD';
            }

            const savedState = shop.itemStates?.[item.id];

            return (
              <View
                key={item.id}
                style={[styles.shopItemCardLarge, { borderColor: theme.border }]}
              >
                <Text style={{ fontSize: 42 }}>{item.icon}</Text>

                <Text style={[styles.shopName, { color: theme.text }]}>{item.name}</Text>

                <Text style={[styles.shopPrice, { color: theme.sub }]}>
                  열매 {item.price}개
                </Text>

                <Text style={[styles.shopCategoryText, { color: theme.sub }]}>
                  {item.category === 'plant' && '식물'}
                  {item.category === 'animal' && '동물'}
                  {item.category === 'furniture' && '가구'}
                  {item.category === 'decor' && '장식'}
                </Text>

                {!unlocked ? (
                  <Text style={[styles.shopLockedText, { color: theme.red }]}>
                    {getUnlockText(item)}
                  </Text>
                ) : owned ? (
                  <Text style={[styles.shopOwnedText, { color: theme.primaryDeep }]}>
                    {placed ? '정원에 꺼내 둠' : '구매 완료'}
                  </Text>
                ) : (
                  <Text style={[styles.shopOwnedText, { color: theme.sub }]}>
                    아직 구매하지 않음
                  </Text>
                )}

                {savedState && owned && !placed ? (
                  <Text style={[styles.shopSavedStateText, { color: theme.sub }]}>
                    이전 크기 {Number(savedState.scale || 1).toFixed(1)}배
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.buyBtn, { backgroundColor: buttonColor }]}
                  onPress={buttonAction}
                >
                  <Text style={styles.buyBtnText}>{buttonLabel}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================
// 📌 [16] ProfileScreen
// =============================
function ProfileScreen({ navigation, route, onLogout }) {
  const { theme, themeKey, updateThemeKey } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { userId } = route.params;

  const [profile, setProfileState] = useState({
    nickname: userId,
    avatar: '👤',
    photoUri: '',
  });

  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(userId);
  const [tempAvatar, setTempAvatar] = useState('👤');
  const [tempPhotoUri, setTempPhotoUri] = useState('');
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [tempNotificationMessage, setTempNotificationMessage] = useState(
    DEFAULT_SETTINGS.notificationMessage
  );

  useEffect(() => {
    const loadProfileData = async () => {
      const p = await loadProfile(userId);
      const s = await loadSettings();

      setProfileState(p);
      setTempName(p.nickname || userId);
      setTempAvatar(p.avatar || '👤');
      setTempPhotoUri(p.photoUri || '');
      setSettingsState(s);
      setTempNotificationMessage(
        s.notificationMessage || DEFAULT_SETTINGS.notificationMessage
      );
    };

    const unsub = navigation.addListener('focus', loadProfileData);
    loadProfileData();
    return unsub;
  }, [navigation, userId]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한 필요', '갤러리 접근 권한을 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: !IS_WEB,
      aspect: [1, 1],
      base64: IS_WEB,
    });

    const pickedUri = getPickerImageUri(result.assets?.[0]);

    if (!result.canceled && pickedUri) {
      setTempPhotoUri(pickedUri);
    }
  };

  const saveProfileChanges = async () => {
    const next = {
      nickname: tempName.trim() || userId,
      avatar: tempAvatar,
      photoUri: tempPhotoUri || '',
    };

    await saveProfile(userId, next);
    setProfileState(next);
    setEditing(false);
    Alert.alert('완료', '프로필이 저장되었습니다.');
  };

  const logout = async () => {
  const doLogout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.autoLogin);
    onLogout?.();
  };

  if (IS_WEB) {
    const ok = window.confirm('정말 로그아웃 하시겠어요?');
    if (ok) {
      await doLogout();
    }
    return;
  }

  Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
    { text: '취소', style: 'cancel' },
    {
      text: '로그아웃',
      style: 'destructive',
      onPress: doLogout,
    },
  ]);
};

  const handleThemeChange = async (nextThemeKey) => {
    const next = { ...settings, themeKey: nextThemeKey };
    setSettingsState(next);
    await saveSettings(next);
    await updateThemeKey(nextThemeKey);
  };

  const onToggleWeather = async (value) => {
    const next = {
      ...settings,
      weatherEnabled: value,
    };

    setSettingsState(next);
    await saveSettings(next);
  };

  const onToggleReminderBanner = async (value) => {
    const next = {
      ...settings,
      reminderBannerEnabled: value,
    };

    setSettingsState(next);
    await saveSettings(next);
  };

  const saveReminderMessage = async () => {
    const next = {
      ...settings,
      notificationMessage:
        tempNotificationMessage.trim() || DEFAULT_SETTINGS.notificationMessage,
      reminderBannerEnabled: settings.reminderBannerEnabled ?? true,
    };

    setSettingsState(next);
    await saveSettings(next);
    Alert.alert('완료', '홈 화면 리마인드 문구가 저장되었어요.');
  };

  return (
    <ScrollView
      style={[styles.profileContainer, { backgroundColor: theme.bg }]}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 12),
        paddingBottom: 30,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.profileHeader, { backgroundColor: theme.card }]}>
        <View
          style={[
            styles.avatarCircleLarge,
            { backgroundColor: theme.greenMint, borderColor: theme.primary },
          ]}
        >
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.avatarPhotoLarge} />
          ) : (
            <Text style={{ fontSize: 40 }}>{profile.avatar}</Text>
          )}
        </View>

        {editing ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TextInput
              style={[styles.editInputBox, { borderColor: theme.border, color: theme.text }]}
              value={tempName}
              onChangeText={setTempName}
              maxLength={10}
              placeholder="이름을 입력해주세요"
              placeholderTextColor={theme.sub}
            />

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                styles.profileGalleryBtn,
                { backgroundColor: theme.primary },
              ]}
              onPress={pickImage}
            >
              <Text style={styles.primaryBtnText}>갤러리에서 프로필 사진 선택</Text>
            </TouchableOpacity>

            {!!tempPhotoUri && (
              <Image source={{ uri: tempPhotoUri }} style={styles.previewPhoto} />
            )}

            <Text style={[styles.profileEditSectionTitle, { color: theme.sub }]}>
              이모티콘 아바타 선택
            </Text>

            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => {
                const selected = a === tempAvatar;

                return (
                  <TouchableOpacity
                    key={a}
                    onPress={() => setTempAvatar(a)}
                    style={[
                      styles.avatarPick,
                      { backgroundColor: '#F0F5F1' },
                      selected && {
                        backgroundColor: theme.yellow,
                        borderWidth: 2,
                        borderColor: theme.primaryDeep,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{a}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={saveProfileChanges}
            >
              <Text style={styles.primaryBtnText}>저장</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {profile.nickname || userId}
            </Text>

            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={[styles.subText, { color: theme.sub }]}>
                이름 / 아바타 / 사진 수정 〉
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.profileEmail, { color: theme.sub }]}>아이디: {userId}</Text>
      </View>

      <View style={styles.settingSection}>
        <Text style={[styles.sectionLabel, { color: theme.sub }]}>테마 색상</Text>

        <View style={[styles.settingBox, { borderColor: theme.border }]}>
          <View style={styles.themeGrid}>
            {Object.entries(THEME_OPTIONS).map(([key, item]) => {
              const selected = key === themeKey;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.themeChip,
                    {
                      borderColor: selected ? theme.primaryDeep : theme.border,
                      backgroundColor: selected ? theme.greenMint : theme.card,
                    },
                  ]}
                  onPress={() => handleThemeChange(key)}
                >
                  <View style={[styles.themePreviewDot, { backgroundColor: item.primary }]} />
                  <Text style={[styles.themeChipText, { color: theme.text }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.sub }]}>홈 설정</Text>

        <View
          style={[styles.alarmCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.alarmRow}>
            <Text style={[styles.alarmRowTitle, { color: theme.text }]}>
              홈 화면 날씨 표시
            </Text>
            <Switch value={settings.weatherEnabled ?? true} onValueChange={onToggleWeather} />
          </View>
        </View>

        <View
          style={[styles.alarmCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.alarmRow}>
            <Text style={[styles.alarmRowTitle, { color: theme.text }]}>
              홈 화면 리마인드 배너 표시
            </Text>
            <Switch
              value={settings.reminderBannerEnabled ?? true}
              onValueChange={onToggleReminderBanner}
            />
          </View>
        </View>

        <View style={[styles.settingBox, { borderColor: theme.border }]}>
          <Text style={[styles.settingItemTitle, { color: theme.text }]}>
            리마인드 문구
          </Text>

          <TextInput
            style={[styles.notificationInput, { borderColor: theme.border, color: theme.text }]}
            placeholder="홈 화면에 표시할 문구를 입력하세요"
            placeholderTextColor={theme.sub}
            value={tempNotificationMessage}
            onChangeText={setTempNotificationMessage}
            maxLength={60}
          />

          <TouchableOpacity
            style={[styles.smallSaveBtn, { backgroundColor: theme.primary }]}
            onPress={saveReminderMessage}
          >
            <Text style={styles.smallSaveBtnText}>문구 저장</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.settingBtn, { borderColor: theme.border }]}
          onPress={logout}
        >
          <Text style={{ color: theme.red, fontWeight: 'bold' }}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// =============================
// 📌 [17-1] 테마별 달력 표시 색
// =============================
function getCalendarColors(themeKey, theme) {
  switch (themeKey) {
    case 'peach':
      return {
        selectedBg: '#F6E3DD',
        selectedText: theme.text,
        dot: '#B67866',
        todayText: '#B67866',
        todayBg: '#FAEEEA',
        disabledText: '#D8B8AE',
        sectionTitle: theme.sub,
      };

    case 'sky':
      return {
        selectedBg: '#DCEBFF',
        selectedText: theme.text,
        dot: '#4F79B8',
        todayText: '#4F79B8',
        todayBg: '#EEF5FF',
        disabledText: '#B7C9E6',
        sectionTitle: theme.sub,
      };

    case 'lavender':
      return {
        selectedBg: '#E9DDF7',
        selectedText: theme.text,
        dot: '#7B5FA6',
        todayText: '#7B5FA6',
        todayBg: '#F5EEFC',
        disabledText: '#CBBBE2',
        sectionTitle: theme.sub,
      };

    case 'forest':
    default:
      return {
        selectedBg: theme.greenLight,
        selectedText: theme.text,
        dot: theme.primaryDeep,
        todayText: theme.primaryDeep,
        todayBg: theme.greenMint,
        disabledText: '#B8C4B6',
        sectionTitle: theme.sub,
      };
  }
}

// =============================
// 📌 [17] DiaryListScreen
// =============================
function DiaryListScreen({ navigation, route }) {
  const { theme, themeKey } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { userId } = route.params;
  const [diaries, setDiariesState] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [menuDiaryId, setMenuDiaryId] = useState(null);

  const loadAll = async () => {
    const saved = await loadDiaries();
    const mine = saved
      .filter((d) => d.userId === userId)
      .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
    setDiariesState(mine);
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadAll);
    loadAll();
    return unsub;
  }, [navigation, userId]);

  const grouped = useMemo(() => {
    const map = {};
    diaries.forEach((d) => {
      if (!map[d.dateKey]) map[d.dateKey] = [];
      map[d.dateKey].push(d);
    });
    return map;
  }, [diaries]);

  const calendarColors = useMemo(() => {
    return getCalendarColors(themeKey, theme);
  }, [themeKey, theme]);

  const markedDates = useMemo(() => {
    const marks = {};

    Object.keys(grouped).forEach((dateKey) => {
      marks[dateKey] = {
        marked: true,
        dotColor: calendarColors.dot,
      };
    });

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: calendarColors.selectedBg,
      selectedTextColor: calendarColors.selectedText,
      marked: true,
      dotColor: calendarColors.dot,
    };

    return marks;
  }, [grouped, selectedDate, calendarColors]);

  const selectedDiaries = grouped[selectedDate] || [];

  const deleteDiary = async (id) => {
    const all = await loadDiaries();
    const next = all.filter((d) => d.id !== id);
    await saveDiaries(next);
    setMenuDiaryId(null);
    loadAll();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: 24,
        }}
      >
        <Text style={[styles.screenTitle, { color: theme.text }]}>📔 나의 일기장</Text>

        <View style={[styles.cardBox, { borderColor: theme.border }]}>
          <Calendar
            key={`diary-calendar-${themeKey}`}
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              todayTextColor: calendarColors.todayText,
              todayBackgroundColor: calendarColors.todayBg,
              selectedDayBackgroundColor: calendarColors.selectedBg,
              selectedDayTextColor: calendarColors.selectedText,
              dotColor: calendarColors.dot,
              selectedDotColor: calendarColors.dot,
              arrowColor: calendarColors.dot,
              monthTextColor: theme.text,
              indicatorColor: calendarColors.dot,
              textDayStyle: { color: theme.text },
              textDisabledColor: calendarColors.disabledText,
              textSectionTitleColor: calendarColors.sectionTitle,
              textDayFontWeight: '600',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '700',
            }}
          />
        </View>

        <Text style={[styles.sectionTitle2, { color: theme.text }]}>
          {formatDateLabel(selectedDate)} ({weekdayLabel(selectedDate)})의 기록
        </Text>

        {selectedDiaries.length === 0 ? (
          <View style={[styles.emptyWrap, { borderColor: theme.border }]}>
            <Text style={{ color: theme.sub }}>이 날짜에는 아직 기록이 없어요.</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 14, backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('DiaryWrite', { dateKey: selectedDate, userId })}
            >
              <Text style={styles.primaryBtnText}>이 날짜에 기록하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          selectedDiaries.map((diary) => (
            <View key={diary.id} style={[styles.diaryCard, { borderColor: theme.border }]}>
              <View style={styles.diaryCardTop}>
                <Text style={[styles.diaryEmotion, { color: theme.text }]}>
                  {diary.emoji} {diary.emotion}
                </Text>

                <TouchableOpacity
                  onPress={() => setMenuDiaryId(menuDiaryId === diary.id ? null : diary.id)}
                >
                  <Text style={{ fontSize: 20, color: theme.softBrown }}>⋯</Text>
                </TouchableOpacity>
              </View>

              {menuDiaryId === diary.id && (
                <View style={styles.inlineMenu}>
                  <TouchableOpacity
                    onPress={() => {
                      setMenuDiaryId(null);
                      navigation.navigate('DiaryEdit', { diaryId: diary.id });
                    }}
                  >
                    <Text style={[styles.inlineMenuText, { color: theme.sub }]}>수정</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteDiary(diary.id)}>
                    <Text style={[styles.inlineMenuText, { color: '#C95D5D' }]}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}

              {diary.image && (
                <Image
                  source={{ uri: diary.image }}
                  style={{
                    width: '100%',
                    height: 180,
                    borderRadius: 12,
                    marginTop: 10,
                    marginBottom: 8,
                  }}
                  resizeMode="cover"
                />
              )}

              <Text style={[styles.diaryText, { color: theme.text }]}>
                {diary.text || '내용 없음'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================
// 📌 [18] DiaryWriteScreen
// =============================
function DiaryWriteScreen({ navigation, route }) {
  const { theme } = useAppTheme();
  const { dateKey, userId } = route.params;
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert('권한 필요', '사진 접근 권한을 허용해주세요.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: !IS_WEB,
    aspect: [4, 3],
    base64: IS_WEB,
  });

  const pickedUri = getPickerImageUri(result.assets?.[0]);

  if (!result.canceled && pickedUri) {
    setImage(pickedUri);
  }
};

  const removeImage = () => {
    setImage(null);
  };

  const saveDiaryEntry = async () => {
    if (!selectedEmotion) {
      Alert.alert('알림', '감정을 선택해주세요.');
      return;
    }

    const emotionObj = ALL_EMOTIONS.find((e) => e.name === selectedEmotion);
    const all = await loadDiaries();

    all.unshift({
      id: uid(),
      userId,
      dateKey,
      emotion: selectedEmotion,
      emoji: emotionObj?.emoji || '🙂',
      text: text.trim(),
      image: image,
      createdAt: Date.now(),
    });

    await saveDiaries(all);

    const todayKey = formatDateKey(new Date());

    if (dateKey === todayKey) {
      await markAttendanceForUser(userId, dateKey);
      Alert.alert('저장 완료', '오늘의 마음이 저장되고 출석과 물방울이 반영되었어요 🌿');
    } else {
      Alert.alert('저장 완료', '지난 날짜의 기록이 저장되었어요.');
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>✍️ 마음 남기기</Text>
        <Text style={[styles.screenSub, { color: theme.sub }]}>{formatDateLabel(dateKey)}</Text>

        <Text style={[styles.label, { color: theme.text }]}>오늘의 주요 감정은 무엇인가요?</Text>

        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={true}
  style={styles.horizontalScrollBox}
  contentContainerStyle={styles.emotionScrollContent}
  keyboardShouldPersistTaps="handled"
>
  {ALL_EMOTIONS.map((item) => {
    const selected = selectedEmotion === item.name;
    return (
      <TouchableOpacity
        key={item.name}
        style={[
          styles.emotionBoxWide,
          { borderColor: theme.border },
          selected && {
            backgroundColor: theme.yellow,
            borderColor: theme.primaryDeep,
            borderWidth: 2,
          },
        ]}
        onPress={() => setSelectedEmotion(item.name)}
      >
        <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
        <Text style={[styles.emotionName, { color: selected ? theme.text : theme.sub }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  })}
</ScrollView>

        <Text style={[styles.label, { color: theme.text }]}>오늘의 기록</Text>
        <TextInput
          style={[styles.textArea, { borderColor: theme.border, color: theme.text }]}
          placeholder="바람처럼 천천히, 오늘의 마음을 적어보세요"
          placeholderTextColor={theme.sub}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={200}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: theme.greenLight,
              marginTop: 12,
              borderWidth: 1,
              borderColor: theme.border,
            },
          ]}
          onPress={pickImage}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
            {image ? '📷 사진 다시 선택' : '📷 사진 추가'}
          </Text>
        </TouchableOpacity>

        {image && (
          <View style={{ marginTop: 12 }}>
            <Image
              source={{ uri: image }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 14,
              }}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.card,
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                },
              ]}
              onPress={removeImage}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.red }]}>사진 삭제</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
          onPress={saveDiaryEntry}
        >
          <Text style={styles.primaryBtnText}>마음을 남기기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================
// 📌 [19] DiaryEditScreen
// =============================
function DiaryEditScreen({ navigation, route }) {
  const { theme } = useAppTheme();
  const { diaryId } = route.params;
  const [loaded, setLoaded] = useState(false);
  const [dateKey, setDateKey] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const all = await loadDiaries();
      const diary = all.find((d) => d.id === diaryId);

      if (diary && mounted) {
        setDateKey(diary.dateKey);
        setSelectedEmotion(diary.emotion);
        setText(diary.text || '');
        setImage(diary.image || null);
        setLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [diaryId]);

  const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert('권한 필요', '사진 접근 권한을 허용해주세요.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: !IS_WEB,
    aspect: [4, 3],
    base64: IS_WEB,
  });

  const pickedUri = getPickerImageUri(result.assets?.[0]);

  if (!result.canceled && pickedUri) {
    setImage(pickedUri);
  }
};

  const removeImage = () => {
    setImage(null);
  };

  const saveEdit = async () => {
    if (!selectedEmotion) {
      Alert.alert('알림', '감정을 선택해주세요.');
      return;
    }

    const all = await loadDiaries();
    const emotionObj = ALL_EMOTIONS.find((e) => e.name === selectedEmotion);

    const next = all.map((d) =>
      d.id === diaryId
        ? {
            ...d,
            emotion: selectedEmotion,
            emoji: emotionObj?.emoji || d.emoji,
            text: text.trim(),
            image: image,
          }
        : d
    );

    await saveDiaries(next);
    Alert.alert('완료', '기록이 수정되었어요.');
    navigation.goBack();
  };

  if (!loaded) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
        <View style={styles.centerContainer}>
          <Text>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>✏️ 기록 수정</Text>
        <Text style={[styles.screenSub, { color: theme.sub }]}>{formatDateLabel(dateKey)}</Text>

        <Text style={[styles.label, { color: theme.text }]}>감정 수정</Text>

        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={true}
  style={styles.horizontalScrollBox}
  contentContainerStyle={styles.emotionScrollContent}
  keyboardShouldPersistTaps="handled"
>
  {ALL_EMOTIONS.map((item) => {
    const selected = selectedEmotion === item.name;
    return (
      <TouchableOpacity
        key={item.name}
        style={[
          styles.emotionBoxWide,
          { borderColor: theme.border },
          selected && {
            backgroundColor: theme.yellow,
            borderColor: theme.primaryDeep,
            borderWidth: 2,
          },
        ]}
        onPress={() => setSelectedEmotion(item.name)}
      >
        <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
        <Text style={[styles.emotionName, { color: selected ? theme.text : theme.sub }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  })}
</ScrollView>
        <Text style={[styles.label, { color: theme.text }]}>내용 수정</Text>
        <TextInput
          style={[styles.textArea, { borderColor: theme.border, color: theme.text }]}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={200}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: theme.greenLight,
              marginTop: 12,
              borderWidth: 1,
              borderColor: theme.border,
            },
          ]}
          onPress={pickImage}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
            {image ? '📷 사진 교체하기' : '📷 사진 추가하기'}
          </Text>
        </TouchableOpacity>

        {image && (
          <View style={{ marginTop: 12 }}>
            <Image
              source={{ uri: image }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 14,
              }}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.card,
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                },
              ]}
              onPress={removeImage}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.red }]}>사진 삭제</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
          onPress={saveEdit}
        >
          <Text style={styles.primaryBtnText}>수정 저장하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================
// 📌 [20] AttendanceScreen
// =============================
function AttendanceScreen({ route, navigation }) {
  const { theme } = useAppTheme();
  const { userId } = route.params;
  const [attendance, setAttendance] = useState({});
  const todayKey = formatDateKey(new Date());

  useEffect(() => {
    (async () => {
      setAttendance(await loadAttendance());
    })();
  }, []);

  const myAttendance = attendance[userId] || {};
  const isTodayChecked = !!myAttendance[todayKey];

  const markedDates = useMemo(() => {
    const marks = {};
    Object.keys(myAttendance).forEach((dateKey) => {
      marks[dateKey] = {
        marked: true,
        selected: true,
        selectedColor: theme.greenSoft,
      };
    });

    if (!marks[todayKey]) {
      marks[todayKey] = { selected: true, selectedColor: theme.primary };
    }

    return marks;
  }, [myAttendance, todayKey, theme.greenSoft, theme.primary]);

  const attendanceCount = Object.keys(myAttendance).length;

  const checkAttendance = async () => {
    if (isTodayChecked) {
      Alert.alert('안내', '오늘은 이미 일기 작성으로 출석이 완료되었어요.');
      return;
    }

    const allDiaries = await loadDiaries();
    const hasTodayDiary = allDiaries.some(
      (d) => d.userId === userId && d.dateKey === todayKey
    );

    if (!hasTodayDiary) {
      Alert.alert('안내', '오늘 일기를 작성해야 출석체크와 물방울 지급이 가능해요.');
      return;
    }

    Alert.alert('안내', '일기를 저장하면 자동으로 출석과 물방울이 반영돼요.');
  };

  const handleAttendancePress = async () => {
    if (isTodayChecked) {
      Alert.alert('안내', '오늘은 이미 출석 완료했어요.');
      return;
    }

    const allDiaries = await loadDiaries();
    const hasTodayDiary = allDiaries.some(
      (d) => d.userId === userId && d.dateKey === todayKey
    );

    if (!hasTodayDiary) {
      navigation.navigate('DiaryWrite', { dateKey: todayKey, userId });
      return;
    }

    Alert.alert('안내', '일기를 저장하면 자동으로 출석 처리돼요.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>✅ 출석체크</Text>
        <Text style={[styles.screenSub, { color: theme.sub }]}>
          오늘 일기를 작성하면 자동으로 출석과 물방울이 반영돼요
        </Text>

        <View style={[styles.cardBox, { borderColor: theme.border }]}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>
            총 출석일: {attendanceCount}일
          </Text>
        </View>

        <View style={[styles.cardBox, { borderColor: theme.border }]}>
          <Calendar
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: theme.primary,
              todayTextColor: theme.primaryDeep,
              arrowColor: theme.primary,
            }}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          onPress={handleAttendancePress}
        >
          <Text style={styles.primaryBtnText}>
            {isTodayChecked ? '오늘 출석 완료' : '오늘 일기 작성하러 가기'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================
// 📌 [21] StatisticsScreen
// =============================
function StatisticsScreen({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const { userId } = route.params || {};
  const [pssData, setPssData] = useState([]);
  const [avgScore, setAvgScore] = useState(0);
  const [emotionData, setEmotionData] = useState(
    ALL_EMOTIONS.map((item) => ({
      emoji: item.emoji,
      count: 0,
      label: item.name,
    }))
  );
  const [topEmotion, setTopEmotion] = useState('없음');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadRealStats();
    });
    loadRealStats();
    return unsubscribe;
  }, [navigation, userId]);

  const loadRealStats = async () => {
    try {
      const savedPss = await AsyncStorage.getItem('pss_list');
      if (savedPss !== null) {
        const pssList = JSON.parse(savedPss);
        const recentPss = pssList.slice(0, 4).reverse();
        setPssData(recentPss);

        if (recentPss.length > 0) {
          setAvgScore(
            (
              recentPss.reduce((acc, curr) => acc + curr.score, 0) / recentPss.length
            ).toFixed(1)
          );
        } else {
          setAvgScore(0);
        }
      } else {
        setPssData([]);
        setAvgScore(0);
      }

      const savedDiaries = await AsyncStorage.getItem('diary_list');
      if (savedDiaries !== null) {
        const diaries = JSON.parse(savedDiaries);
        const mine = userId ? diaries.filter((d) => d.userId === userId) : diaries;
        const recentDiaries = mine.slice(0, 7);

        const newEmotionStats = ALL_EMOTIONS.map((item) => ({
          emoji: item.emoji,
          count: 0,
          label: item.name,
        }));

        recentDiaries.forEach((diary) => {
          const target = newEmotionStats.find((e) => e.label === diary.emotion);
          if (target) target.count += 1;
        });

        setEmotionData(newEmotionStats);

        const max = newEmotionStats.reduce((prev, current) =>
          prev.count > current.count ? prev : current
        );
        setTopEmotion(max.count > 0 ? max.label : '없음');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const clearPssData = async () => {
    await AsyncStorage.removeItem('pss_list');
    setPssData([]);
    setAvgScore(0);
    Alert.alert('안내', '스트레스 기록이 초기화되었습니다.');
  };

  return (
    <ScrollView
      style={[styles.scrollBackground, { backgroundColor: theme.bg }]}
      contentContainerStyle={{
        ...styles.scrollContent,
        paddingTop: Math.max(insets.top, 12),
        paddingBottom: 24,
      }}
    >
      <Text style={[styles.sectionTitle, { marginTop: 10, color: theme.text }]}>
        🎭 최근 7일 감정 분포
      </Text>

      <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
        {emotionData.map((item, index) => (
          <View key={index} style={styles.emotionStatRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.statEmoji}>{item.emoji}</Text>
              <Text style={[styles.statLabel, { color: theme.text }]}>{item.label}</Text>
            </View>

            <View style={[styles.statLineContainer, { backgroundColor: theme.bg }]}>
              <View
                style={[
                  styles.statLine,
                  {
                    width: `${Math.min((item.count / 7) * 100, 100)}%`,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            </View>

            <Text style={[styles.statCount, { color: theme.text }]}>{item.count}일</Text>
          </View>
        ))}

        <Text style={[styles.statsDesc, { color: theme.sub, borderTopColor: theme.bg }]}>
          최근 가장 많이 느낀 감정은 '{topEmotion}' 입니다.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>📉 최근 스트레스 변화</Text>

      <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
        {pssData.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.sub }]}>기록이 없습니다.</Text>
        ) : (
          <>
            <View style={styles.chartContainer}>
              {pssData.map((item, index) => (
                <View key={item.id || index} style={styles.barColumn}>
                  <View
                    style={[
                      styles.barChart,
                      { height: item.score * 3.5, backgroundColor: theme.primary },
                    ]}
                  />
                  <Text style={[styles.barScore, { color: theme.text }]}>{item.score}</Text>
                  <Text style={[styles.barLabel, { color: theme.sub }]}>{item.date}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.statsDesc, { color: theme.sub, borderTopColor: theme.bg }]}>
              최근 평균 {avgScore}점 입니다.
            </Text>
          </>
        )}
      </View>

      {pssData.length > 0 && (
        <TouchableOpacity style={{ alignSelf: 'center', marginTop: 15 }} onPress={clearPssData}>
          <Text style={{ color: theme.icon, textDecorationLine: 'underline' }}>
            검사 기록 지우기
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// =============================
// 📌 [22] PSSScreen
// =============================
function PSSScreen({ navigation }) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [scores, setScores] = useState(Array(10).fill(null));
  const scrollRef = useRef(null);
  const questionLayouts = useRef({});

  const questions = [
    '1. 예상치 못한 일이 생겨서 기분이 나빴던 적이 얼마나 있었습니까?',
    '2. 인생에서 중요한 일들을 통제할 수 없다고 느낀 적이 얼마나 있었습니까?',
    '3. 신경이 예민해지거나 스트레스를 받은 적이 얼마나 있었습니까?',
    '4. 개인적인 문제를 성공적으로 다루고 있다고 느낀 적이 얼마나 있었습니까?',
    '5. 중요한 변화들을 잘 대처하고 있다고 느낀 적이 얼마나 있었습니까?',
    '6. 주어진 일을 감당할 수 없다고 느낀 적이 얼마나 있었습니까?',
    '7. 짜증나는 일을 스스로 잘 조절할 수 있다고 느낀 적이 얼마나 있었습니까?',
    '8. 내가 모든 일을 다 통제하고 있다고 느낀 적이 얼마나 있었습니까?',
    '9. 통제할 수 없는 일들 때문에 화가 난 적이 얼마나 있었습니까?',
    '10. 어려움이 너무 많이 쌓여 극복할 수 없다고 느낀 적이 얼마나 있었습니까?',
  ];

  const options = [
    { label: '전혀', value: 0 },
    { label: '거의', value: 1 },
    { label: '때때로', value: 2 },
    { label: '자주', value: 3 },
    { label: '매우 자주', value: 4 },
  ];

  const handleScoreSelect = (index, value) => {
    const next = [...scores];
    next[index] = value;
    setScores(next);
  };

  const scrollToQuestion = (index) => {
    if (questionLayouts.current[index] !== undefined) {
      scrollRef.current?.scrollTo({
        y: Math.max(questionLayouts.current[index] - 24, 0),
        animated: true,
      });
    }
  };

  const calculateTotalScore = () => {
    let total = 0;

    for (let i = 0; i < scores.length; i++) {
      if (scores[i] !== null) {
        if ([3, 4, 6, 7].includes(i)) {
          total += 4 - scores[i];
        } else {
          total += scores[i];
        }
      }
    }

    return total;
  };

  const totalScore = calculateTotalScore();

  const savePssResult = async () => {
    const firstUnanswered = scores.indexOf(null);

    if (firstUnanswered !== -1) {
      Alert.alert('알림', `${firstUnanswered + 1}번 질문에 답해주세요.`);
      scrollToQuestion(firstUnanswered);
      return;
    }

    try {
      const existingPss = await AsyncStorage.getItem('pss_list');
      const pssList = existingPss ? JSON.parse(existingPss) : [];
      const today = new Date();

      pssList.unshift({
        id: Date.now().toString(),
        date: `${today.getMonth() + 1}월 ${today.getDate()}일`,
        score: totalScore,
      });

      await AsyncStorage.setItem('pss_list', JSON.stringify(pssList));

      navigation.replace('PSSResult', {
        score: totalScore,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={[styles.pssSafeArea, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.pssTopProgressWrap,
          {
            backgroundColor: theme.bg,
            borderBottomColor: theme.border,
            paddingTop: Math.max(insets.top, 6),
          },
        ]}
      >
        <Text style={[styles.pssProgressTitle, { color: theme.sub }]}>
          진행 상황
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.pssProgressScroll}
          contentContainerStyle={styles.pssProgressRow}
          keyboardShouldPersistTaps="always"
        >
          {questions.map((_, index) => {
            const isAnswered = scores[index] !== null;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pssProgressCircle,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                  isAnswered && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => scrollToQuestion(index)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.pssProgressCircleText,
                    { color: theme.sub },
                    isAnswered && {
                      color: '#FFFFFF',
                      fontWeight: '800',
                    },
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        style={[styles.pssScroll, { backgroundColor: theme.bg }]}
        contentContainerStyle={[
          styles.pssScrollContent,
          {
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pssTitleWrap}>
          <Text style={[styles.pssTitle, { color: theme.text }]}>
            📊 PSS 스트레스 검사
          </Text>

          <Text style={[styles.pssSubtitle, { color: theme.sub }]}>
            지난 한 달 동안, 아래의 상황을 얼마나 자주 겪었는지 선택해 주세요.
          </Text>
        </View>

        {questions.map((q, index) => (
          <View
            key={index}
            style={[
              styles.pssQuestionCard,
              {
                backgroundColor: theme.card,
                shadowColor: theme.text,
              },
            ]}
            onLayout={(e) => {
              questionLayouts.current[index] = e.nativeEvent.layout.y;
            }}
          >
            <Text style={[styles.pssQuestionText, { color: theme.text }]}>
              {q}
            </Text>

            <View style={styles.pssOptionRow}>
              {options.map((opt) => {
                const selected = scores[index] === opt.value;

                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.pssOptionButton,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                      selected && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => handleScoreSelect(index, opt.value)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.pssOptionText,
                        { color: theme.sub },
                        selected && {
                          color: '#FFFFFF',
                          fontWeight: '800',
                        },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.pssBottomBox}>
          <Text style={[styles.pssBottomScore, { color: theme.primaryDeep }]}>
            현재 총점 {totalScore} / 40
          </Text>

          <TouchableOpacity
            style={[styles.pssSubmitButton, { backgroundColor: theme.primary }]}
            onPress={savePssResult}
          >
            <Text style={styles.pssSubmitButtonText}>검사 완료하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================
// 📌 [23] PSSResultScreen
// =============================
function PSSResultScreen({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const { score } = route.params;
  let interpretation = '';
  let level = '';
  let isHighStress = false;

  if (score <= 12) {
    level = '🟢 정상 수준';
    interpretation = '스트레스 정도가 정상적인 수준으로, 심리적으로 안정되어 있습니다.';
  } else if (score <= 15) {
    level = '🟡 약간의 스트레스';
    interpretation = '약간의 스트레스를 받고 계시나 심각하지 않습니다. 가벼운 휴식을 취해보세요.';
    isHighStress = true;
  } else if (score <= 18) {
    level = '🟠 중간 정도의 스트레스';
    interpretation =
      '스트레스를 꽤 받고 있는 것으로 보입니다. 스트레스 해소를 위한 적극적인 노력이 필요합니다.';
    isHighStress = true;
  } else {
    level = '🔴 심한 스트레스';
    interpretation =
      '심한 스트레스를 받고 있습니다. 혼자 감당하기 벅차다면 마음 전문가의 도움을 받기를 권유 드립니다.';
    isHighStress = true;
  }

  return (
    <ScrollView
      style={[styles.scrollBackground, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.resultScoreText, { color: theme.text }]}>
          검사 결과: {score}점 / 40점
        </Text>
        <Text style={styles.resultLevelText}>{level}</Text>
        <View style={{ height: 1, backgroundColor: theme.greenLight, marginVertical: 15 }} />
        <Text style={[styles.resultDescText, { color: theme.sub }]}>{interpretation}</Text>
      </View>

      {isHighStress && (
        <View style={{ marginTop: 25, alignItems: 'center' }}>
          <Text style={{ color: theme.sub, marginBottom: 10 }}>
            잠시 모든 것을 내려놓고 숨을 쉬어볼까요?
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.greenLight }]}
            onPress={() => navigation.navigate('MainTabs', { screen: '명상' })}
          >
            <Text style={[styles.buttonText, { color: theme.primaryDeep }]}>
              🧘 4-7-8 호흡 명상하기
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: theme.primary, marginTop: isHighStress ? 15 : 40 },
        ]}
        onPress={() => navigation.navigate('MainTabs', { screen: '홈' })}
      >
        <Text style={styles.buttonText}>🏠 홈으로 돌아가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
// =============================
// 📌 [24] MeditationScreen
// =============================
function MeditationScreen() {
  const { theme } = useContext(ThemeContext);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('준비');
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const activeRef = useRef(false);
  const scale = useRef(new Animated.Value(1)).current;

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => () => clearTimer(), []);

  const animateCircle = (toValue, seconds) => {
    Animated.timing(scale, {
      toValue,
      duration: seconds * 1000,
      useNativeDriver: true,
    }).start();
  };

  const startPhase = (label, seconds) => {
  setPhase(label);
  setTimeLeft(seconds);

  if (label === '들이마시세요') animateCircle(1.28, seconds);
  else if (label === '멈추세요') animateCircle(1.28, seconds);
  else if (label === '내쉬세요') animateCircle(1, seconds);

    let remain = seconds;
    clearTimer();

    timerRef.current = setInterval(() => {
      remain -= 1;

      if (remain > 0) {
        setTimeLeft(remain);
        return;
      }

      clearTimer();
      if (!activeRef.current) return;

      if (label === '들이마시세요') startPhase('멈추세요', 7);
      else if (label === '멈추세요') startPhase('내쉬세요', 8);
      else startPhase('들이마시세요', 4);
    }, 1000);
  };

  const startBreathing = () => {
    activeRef.current = true;
    setIsActive(true);
    startPhase('들이마시세요', 4);
  };

  const stopBreathing = () => {
    activeRef.current = false;
    clearTimer();
    setIsActive(false);
    setPhase('준비');
    setTimeLeft(0);

    Animated.timing(scale, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={[styles.centerContainer, { padding: 20 }]}>
        <Text style={[styles.meditationPhase, { color: theme.primary }]}>
          {phase === '준비' ? '숲의 공기를 떠올려보세요' : phase}
        </Text>

        <Text style={[styles.meditationSub, { color: theme.sub }]}>
          천천히 숨을 고르며 마음을 쉬게 해주세요
        </Text>

        <View
          style={{ width: 260, height: 260, justifyContent: 'center', alignItems: 'center' }}
        >
          <Animated.View
            style={[
              styles.breathCircle,
              { backgroundColor: theme.greenLight, transform: [{ scale }] },
            ]}
          />
        </View>

        {timeLeft > 0 && (
          <Text style={[styles.timerText, { color: theme.primary }]}>{timeLeft}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { width: 220, backgroundColor: isActive ? '#ff6b6b' : theme.primary },
          ]}
          onPress={isActive ? stopBreathing : startBreathing}
        >
          <Text style={styles.primaryBtnText}>{isActive ? '명상 종료' : '숨 고르기 시작'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
// =============================
// 📌 [24] 반응형 공통 래퍼 (추가)
// =============================
function ScreenScroll({ children, backgroundColor, style, contentContainerStyle }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor }, style]}
      contentContainerStyle={[
        {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 96,
          paddingHorizontal: 16,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

function ScreenView({ children, backgroundColor, style }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// =============================
// 📌 [25] MainTabs
// =============================
function MainTabs({ route }) {
  const { theme } = useAppTheme();
  const { userId, setUserId } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primaryDeep,
        tabBarInactiveTintColor: '#8FA39A',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 2 },
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tab.Screen
        name="홈"
        component={HomeMainScreen}
        initialParams={{ userId }}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="일기"
        component={DiaryListScreen}
        initialParams={{ userId }}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>📔</Text> }}
      />
      <Tab.Screen
        name="명상"
        component={MeditationScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🌿</Text> }}
      />
      <Tab.Screen
        name="검사"
        component={PSSScreen}
        initialParams={{ userId }}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>📋</Text> }}
      />
      <Tab.Screen
        name="통계"
        component={StatisticsScreen}
        initialParams={{ userId }}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🌼</Text> }}
      />
      <Tab.Screen
        name="프로필"
        initialParams={{ userId }}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text> }}
      >
        {(props) => <ProfileScreen {...props} onLogout={() => setUserId(null)} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}



// =============================
// 📌 [27] App 본체
// =============================
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [userId, setUserId] = useState(null);
  const [themeKey, setThemeKey] = useState(DEFAULT_SETTINGS.themeKey);

  const theme = useMemo(() => getThemeColors(themeKey), [themeKey]);

  const updateThemeKey = async (nextThemeKey) => {
    const saved = await loadSettings();
    const next = { ...saved, themeKey: nextThemeKey };
    await saveSettings(next);
    setThemeKey(nextThemeKey);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.autoLogin);
      const savedSettings = await loadSettings();

      

      if (mounted) {
        setThemeKey(savedSettings.themeKey || 'forest');
        setUserId(savedUser);
        setIsReady(true);
      }
    })();

    const t = setTimeout(() => {
      if (mounted) setShowSplash(false);
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <ThemeContext.Provider value={{ theme, themeKey, updateThemeKey }}>
          <SplashScreen />
        </ThemeContext.Provider>
      </SafeAreaProvider>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <ThemeContext.Provider value={{ theme, themeKey, updateThemeKey }}>
          <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
            <View style={styles.centerContainer}>
              <Text>불러오는 중...</Text>
            </View>
          </SafeAreaView>
        </ThemeContext.Provider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={{ theme, themeKey, updateThemeKey }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerTitleAlign: 'center',
              headerTintColor: theme.primaryDeep,
              headerStyle: {
                backgroundColor: theme.card,
                height: Platform.OS === 'android' ? 88 : 96,
              },
              headerTitleStyle: { fontSize: 20, fontWeight: '700' },
              headerShadowVisible: false,
            }}
          >
            {!userId ? (
              <Stack.Screen name="Auth" options={{ headerShown: false }}>
                {(props) => <AuthScreen {...props} onLogin={(id) => setUserId(id)} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
                  {(props) => (
                    <MainTabs
                      {...props}
                      route={{ ...props.route, params: { userId, setUserId } }}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen name="Shop" component={ShopScreen} options={{ title: '상점' }} />
                <Stack.Screen
                  name="Garden"
                  component={GardenScreen}
                  options={{ title: '나의 정원' }}
                />
                <Stack.Screen
                  name="DiaryWrite"
                  component={DiaryWriteScreen}
                  options={{ title: '기록하기' }}
                />
                <Stack.Screen
                  name="DiaryEdit"
                  component={DiaryEditScreen}
                  options={{ title: '기록 수정' }}
                />
                <Stack.Screen
                  name="Attendance"
                  component={AttendanceScreen}
                  options={{ title: '출석체크' }}
                />
                <Stack.Screen
                  name="PSSResult"
                  component={PSSResultScreen}
                  options={{ title: '검사 결과' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BASE_COLORS.bg,
  },

  pssSafeArea: {
    flex: 1,
    backgroundColor: BASE_COLORS.bg,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

horizontalButtonScroll: {
  paddingVertical: 8,
  paddingRight: 24,
},

horizontalScrollBox: {
  width: '100%',
  maxWidth: SCREEN_WIDTH,
  flexGrow: 0,
},

emotionScrollContent: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingRight: 40,
  minWidth: 720,
},

categoryScrollContent: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 16,
  paddingRight: 12,
},

  splashIcon: {
    width: 128,
    height: 128,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  splashTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 24,
  },

  splashSub: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },

  authWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 22,
  },

  loginHero: {
    backgroundColor: '#FBFDFC',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 18,
    borderWidth: 1,
    shadowColor: '#6FAF8F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  loginLogo: {
    fontSize: 52,
    textAlign: 'center',
    marginBottom: 6,
  },

  loginTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },

  loginSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  authTextTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  authTextTab: {
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },

  authTextTabActive: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  authDivider: {
    color: '#C5CFC8',
    marginHorizontal: 4,
    fontSize: 12,
  },

  authHelperBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },

  authHelperText: {
    fontSize: 13,
    lineHeight: 20,
  },

  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    fontSize: 14,
  },

  passwordInputWrap: {
    width: '100%',
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },

  passwordToggleBtn: {
    minWidth: 52,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
  },

  passwordToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  socialLoginWrap: {
    marginTop: 20,
  },

  socialLoginTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '700',
  },

  socialBtn: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  socialBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  homeSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },

  homeContainer: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 40,
  },

  homeTitleWrap: {
    marginBottom: 20,
  },

  homeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  homeTitle: {
    fontSize: 30,
    fontWeight: '800',
  },

  homeGreeting: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  homeSubtitle: {
    fontSize: 15,
    lineHeight: 24,
  },

  homeTopStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  homeTopStatusPill: {
    minWidth: 58,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  treeStatusEmoji: {
    fontSize: 15,
    marginRight: 4,
  },

  treeStatusValue: {
    fontSize: 14,
    fontWeight: '800',
    color: BASE_COLORS.softBrown,
  },

  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  treeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  treeInfoText: {
    marginTop: 8,
  },

  smallWaterCard: {
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  smallWaterEmoji: {
    fontSize: 18,
    marginRight: 6,
  },

  smallWaterLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },

  smallWaterValue: {
    fontSize: 18,
    fontWeight: '900',
  },

  smallWaterNextText: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '700',
  },

  treeTouchWrap: {
    marginTop: 14,
  },

  treePreviewBox: {
    minHeight: 240,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  treeEmoji: {
    fontSize: 76,
    textAlign: 'center',
    marginTop: 8,
  },

  treeTapGuide: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: '900',
  },

  screenSub: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },

  sectionTitle2: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
    gardenScreenWrap: {
  paddingHorizontal: 20,
  paddingTop: 12,
  paddingBottom: 28,
},

  gardenHeaderCard: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },

  gardenHeaderText: {
    fontSize: 14,
    fontWeight: '800',
  },

  gardenHeaderSubText: {
    marginTop: 4,
    fontSize: 12,
  },

  gardenOnlyBox: {
    height: 320,
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 14,
    marginBottom: 14,
    backgroundColor: '#EEF3EE',
  },

  gardenSky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 190,
    backgroundColor: '#EEF3EE',
  },

  gardenMountainLeft: {
    position: 'absolute',
    left: -30,
    bottom: 120,
    width: 230,
    height: 120,
    backgroundColor: '#63B36B',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },

  gardenMountainRight: {
    position: 'absolute',
    right: -20,
    bottom: 115,
    width: 210,
    height: 105,
    backgroundColor: '#4FA65A',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
  },

  gardenField: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 125,
    backgroundColor: '#6CAB58',
  },

  gardenGroundStroke: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 124,
    height: 2,
    backgroundColor: 'rgba(60,90,60,0.18)',
  },

  gardenTree: {
    position: 'absolute',
    left: '33%',
    bottom: 108,
    fontSize: 118,
    zIndex: 2,
  },

  gardenDragItem: {
    position: 'absolute',
  },

  gardenItemTouch: {
    minWidth: 34,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  gardenItemSelected: {
    borderWidth: 2,
    borderColor: '#7BBE85',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  gardenDragEmoji: {
    fontSize: 30,
  },

  editBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  editBarBtn: {
    width: 54,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editBarBtnText: {
    fontSize: 22,
    fontWeight: '900',
    color: BASE_COLORS.softBrown,
  },

  gardenShopBtn: {
    marginTop: 0,
  },

  shopSummaryCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  shopSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  shopSummaryText: {
    fontSize: 14,
    fontWeight: '800',
  },

  recommendRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  recommendBuyBtn: {
    minWidth: 62,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 12,
  },

  categoryChip: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginRight: 8,
  },

  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
  },

  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  shopItemCardLarge: {
    width: '48.3%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 14,
  },

  shopName: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },

  shopPrice: {
    fontSize: 13,
    marginTop: 4,
  },

  shopCategoryText: {
    fontSize: 12,
    marginTop: 3,
  },

  shopLockedText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },

  shopOwnedText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },

  shopSavedStateText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },

  buyBtn: {
    width: '100%',
    minHeight: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },

  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  profileContainer: {
    flex: 1,
  },

  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  avatarCircleLarge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatarPhotoLarge: {
    width: '100%',
    height: '100%',
  },

  previewPhoto: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginTop: 12,
  },

  profileName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
  },

  profileEmail: {
    fontSize: 13,
    marginTop: 10,
  },

  subText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
  },

  editInputBox: {
    width: '100%',
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginTop: 14,
  },
    profileGalleryBtn: {
    marginTop: 12,
  },

  profileEditSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
  },

  avatarGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },

  avatarPick: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },

  settingBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },

  settingItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },

  themeGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
},

  themeChip: {
  minWidth: '47%',
  borderWidth: 1,
  borderRadius: 14,
  paddingVertical: 12,
  paddingHorizontal: 12,
  flexDirection: 'row',
  alignItems: 'center',
},

  themePreviewDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },

  themeChipText: {
    fontSize: 13,
    fontWeight: '700',
  },

  alarmCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  alarmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  alarmRowTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  alarmGuideText: {
    fontSize: 12,
    marginBottom: 10,
  },

  timePickerButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  timePickerButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },

  // =============================
  // 📌 웹용 시간 선택기 추가
  // =============================
  webTimePickerBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },

  webTimePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },

  webTimeBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  webTimeBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },

  webTimeText: {
    flex: 1.4,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '900',
  },

  notificationInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },

  smallSaveBtn: {
    minHeight: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
  },

  smallSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  settingBtn: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },

  diaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },

  diaryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  diaryEmotion: {
    fontSize: 16,
    fontWeight: '800',
  },

  diaryText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
  },

  inlineMenu: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    alignSelf: 'flex-end',
  },

  inlineMenuText: {
    fontSize: 13,
    fontWeight: '700',
  },

  label: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },

  emotionRowSingle: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingRight: 20,
},

  emotionBoxWide: {
    width: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
  },

  emotionName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },

  textArea: {
    minHeight: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },

  emptyWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },

  emptyText: {
    fontSize: 14,
  },

  scrollBackground: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },

  statsCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  emotionStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  statEmoji: {
    fontSize: 20,
    marginRight: 8,
  },

  statLabel: {
    width: 52,
    fontSize: 13,
    fontWeight: '700',
  },

  statLineContainer: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginHorizontal: 8,
  },

  statLine: {
    height: '100%',
    borderRadius: 999,
  },

  statCount: {
    width: 34,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },

  statsDesc: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    fontSize: 13,
    lineHeight: 20,
  },

  chartContainer: {
    minHeight: 180,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 10,
  },

  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },

  barChart: {
    width: 28,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  barScore: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },

  barLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  pssTopProgressWrap: {
    borderBottomWidth: 1,
    paddingBottom: 12,
  },

  pssProgressTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 10,
  },

  pssProgressRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingLeft: 20,
  paddingRight: 20,
},

  pssProgressCircle: {
  width: 38,
  height: 38,
  borderRadius: 19,
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
  flexShrink: 0,
},

  pssProgressCircleText: {
    fontSize: 13,
    fontWeight: '700',
  },

  pssScroll: {
    flex: 1,
  },

  pssScrollContent: {
    padding: 20,
    paddingBottom: 90,
  },

  pssTitleWrap: {
    marginBottom: 16,
  },

  pssTitle: {
    fontSize: 24,
    fontWeight: '900',
  },

  pssSubtitle: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },

  pssQuestionCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  pssQuestionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 14,
  },

  // =============================
  // 📌 중복 제거 후 최종 PSS 버튼 스타일
  // =============================
  pssOptionRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 14,
},


  pssOptionButton: {
  flex: 1,
  height: 50,
  borderRadius: 25,
  borderWidth: 1.4,
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: 4,
  paddingHorizontal: 2,
},

  pssOptionText: {
  fontSize: 11,
  fontWeight: '700',
  textAlign: 'center',
},

  pssBottomBox: {
    marginTop: 6,
    alignItems: 'center',
  },

  pssBottomScore: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },

  pssSubmitButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pssSubmitButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },

  resultCard: {
    borderRadius: 24,
    padding: 22,
  },

  resultScoreText: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },

  resultLevelText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
  },

  resultDescText: {
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
  },

  saveButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },

  meditationPhase: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },

  meditationSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 21,
  },

  breathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },

  timerText: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
  },

  primaryBtn: {
    width: '100%',
    minHeight: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },

  primaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  secondaryBtn: {
    width: '100%',
    minHeight: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },

  secondaryBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  reminderBanner: {
  borderWidth: 1,
  borderRadius: 20,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 16,
  flexDirection: 'row',
  alignItems: 'center',
},

reminderBannerEmoji: {
  fontSize: 26,
  marginRight: 10,
},

reminderBannerTitle: {
  fontSize: 14,
  fontWeight: '900',
},

reminderBannerText: {
  fontSize: 12,
  marginTop: 4,
  lineHeight: 18,
},

reminderBannerArrow: {
  fontSize: 22,
  fontWeight: '900',
  marginLeft: 8,
},

pssProgressScroll: {
  width: '100%',
  flexGrow: 0,
},

});
