import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// 多言語対応 (i18n)
// ============================================

const TRANSLATIONS = {
  ja: {
    appTitle: 'Sticrix',
    newTask: '新しいタスク',
    selectColor: 'カラーを選択',
    done: '完了',
    xyAxisX: '緊急度',
    xyAxisY: '重要度',
    quadrantQ1: '重要 × 緊急',
    quadrantQ2: '重要 × 非緊急',
    quadrantQ3: '非重要 × 緊急',
    quadrantQ4: '非重要 × 非緊急',
    axisImportant: '重要',
    axisNotImportant: '非重要',
    axisUrgent: '緊急',
    axisNotUrgent: '非緊急',
    task1: 'プレゼン資料作成',
    task2: '週次レポート提出',
    task3: 'チームMTG準備',
    task4: 'メール整理',
    task5: 'クライアント連絡',
  },
  en: {
    appTitle: 'Sticrix',
    newTask: 'New Task',
    selectColor: 'Select Color',
    done: 'Done',
    xyAxisX: 'Urgency',
    xyAxisY: 'Importance',
    quadrantQ1: 'Important & Urgent',
    quadrantQ2: 'Important & Not Urgent',
    quadrantQ3: 'Not Important & Urgent',
    quadrantQ4: 'Not Important & Not Urgent',
    axisImportant: 'Important',
    axisNotImportant: 'Not Important',
    axisUrgent: 'Urgent',
    axisNotUrgent: 'Not Urgent',
    task1: 'Create presentation',
    task2: 'Submit weekly report',
    task3: 'Prepare team meeting',
    task4: 'Organize emails',
    task5: 'Contact client',
  },
};

const getLanguage = () => {
  const locale = Localization.locale || 'en';
  return locale.startsWith('ja') ? 'ja' : 'en';
};

const LanguageContext = createContext('en');

const useTranslation = () => {
  const lang = useContext(LanguageContext);
  return (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
};

// ============================================
// 定数
// ============================================

const STICKY_COLORS = [
  { id: 'cream', bg: '#FFF8E7', border: '#E8DCC4', text: '#5C4A32' },
  { id: 'sakura', bg: '#FFE4E8', border: '#F5C6CB', text: '#8B4D5C' },
  { id: 'matcha', bg: '#E8F5E9', border: '#C8E6C9', text: '#4A6B4D' },
  { id: 'sora', bg: '#E3F2FD', border: '#BBDEFB', text: '#3D5A80' },
  { id: 'fuji', bg: '#EDE7F6', border: '#D1C4E9', text: '#5E4A7D' },
  { id: 'kincha', bg: '#FFF3E0', border: '#FFE0B2', text: '#8D6E4C' },
];

const MODES = { XY: 'xy', KANBAN: 'kanban', QUADRANT: 'quadrant' };

const getDefaultLabels = (lang) => ({
  xy: { x: TRANSLATIONS[lang].xyAxisX, y: TRANSLATIONS[lang].xyAxisY },
  kanban: { col1: 'Todo', col2: 'Doing', col3: 'Done' },
  quadrant: {
    q1: TRANSLATIONS[lang].quadrantQ1,
    q2: TRANSLATIONS[lang].quadrantQ2,
    q3: TRANSLATIONS[lang].quadrantQ3,
    q4: TRANSLATIONS[lang].quadrantQ4,
    axisTop: TRANSLATIONS[lang].axisImportant,
    axisBottom: TRANSLATIONS[lang].axisNotImportant,
    axisLeft: TRANSLATIONS[lang].axisNotUrgent,
    axisRight: TRANSLATIONS[lang].axisUrgent,
  },
});

const getInitialTasks = (lang) => [
  { id: 1, text: TRANSLATIONS[lang].task1, color: 'sakura', x: 75, y: 20, column: 'col1', quadrant: 'q1', order: 0, kanbanOrder: 0 },
  { id: 2, text: TRANSLATIONS[lang].task2, color: 'matcha', x: 60, y: 45, column: 'col1', quadrant: 'q2', order: 0, kanbanOrder: 1 },
  { id: 3, text: TRANSLATIONS[lang].task3, color: 'sora', x: 30, y: 70, column: 'col2', quadrant: 'q3', order: 0, kanbanOrder: 0 },
  { id: 4, text: TRANSLATIONS[lang].task4, color: 'cream', x: 20, y: 85, column: 'col3', quadrant: 'q4', order: 0, kanbanOrder: 0 },
  { id: 5, text: TRANSLATIONS[lang].task5, color: 'fuji', x: 85, y: 15, column: 'col1', quadrant: 'q1', order: 1, kanbanOrder: 2 },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================
// Storage
// ============================================

const Storage = {
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch { return null; }
  },
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error('Storage error:', e); }
  },
};

// ============================================
// 付箋コンポーネント
// ============================================

const StickyNote = ({ task, onDrag, onLongPress, onDelete, isEditing, onEditComplete, editText, setEditText }) => {
  const colorConfig = STICKY_COLORS.find(c => c.id === task.color) || STICKY_COLORS[0];
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const longPressTimer = useRef(null);
  const t = useTranslation();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isEditing,
      onMoveShouldSetPanResponder: (_, g) => !isEditing && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
      onPanResponderGrant: () => {
        longPressTimer.current = setTimeout(() => onLongPress?.(task.id), 500);
        Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }).start();
      },
      onPanResponderMove: (_, g) => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
        pan.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (evt, g) => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); }
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        onDrag?.(task, g, evt.nativeEvent);
      },
    })
  ).current;

  return (
    <Animated.View
      {...(isEditing ? {} : panResponder.panHandlers)}
      style={[
        styles.stickyNote,
        {
          backgroundColor: colorConfig.bg,
          borderColor: colorConfig.border,
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
        },
      ]}
    >
      <View style={[styles.stickyFold, { borderBottomColor: colorConfig.border, borderRightColor: colorConfig.border }]} />
      {isEditing ? (
        <View style={styles.stickyEdit}>
          <TextInput
            style={[styles.stickyEditInput, { color: colorConfig.text }]}
            value={editText}
            onChangeText={setEditText}
            autoFocus
            multiline
            maxLength={50}
          />
          <TouchableOpacity style={[styles.editDoneBtn, { backgroundColor: colorConfig.border }]} onPress={() => onEditComplete(task.id, editText)}>
            <Text style={[styles.editDoneBtnText, { color: colorConfig.text }]}>{t('done')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.stickyText, { color: colorConfig.text }]} numberOfLines={3}>{task.text}</Text>
          <TouchableOpacity style={styles.stickyDelete} onPress={() => onDelete(task.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.stickyDeleteText, { color: colorConfig.border }]}>×</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

// ============================================
// 編集可能ラベル
// ============================================

const EditableLabel = ({ value, onChange, style }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => { setEditValue(value); }, [value]);

  const handleSubmit = () => {
    if (editValue.trim()) onChange(editValue.trim());
    else setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TextInput
        style={[styles.editableLabelInput, style]}
        value={editValue}
        onChangeText={setEditValue}
        onBlur={handleSubmit}
        onSubmitEditing={handleSubmit}
        autoFocus
        maxLength={20}
      />
    );
  }

  return (
    <TouchableOpacity onPress={() => setIsEditing(true)}>
      <Text style={[styles.editableLabel, style]}>{value}</Text>
    </TouchableOpacity>
  );
};

// ============================================
// XY軸モード
// ============================================

const XYAxisView = ({ tasks, labels, onLabelChange, onDrag, onLongPress, onDelete, editingId, onEditComplete, editText, setEditText }) => {
  const containerRef = useRef(null);
  const [layout, setLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const handleDrag = (task, gestureState, nativeEvent) => {
    if (layout.width === 0) return;
    const newX = task.x + (gestureState.dx / layout.width) * 100;
    const newY = task.y - (gestureState.dy / layout.height) * 100;
    onDrag(task.id, {
      x: Math.max(5, Math.min(95, newX)),
      y: Math.max(5, Math.min(95, newY)),
    });
  };

  return (
    <View style={styles.matrixContainer}>
      <Text style={[styles.xyLabel, styles.xyLabelY]}>{labels.y}</Text>
      <Text style={[styles.xyLabel, styles.xyLabelX]}>{labels.x}</Text>
      <View style={styles.xyArrowY}>
        <View style={styles.arrowLine} />
        <View style={styles.arrowHeadUp} />
      </View>
      <View style={styles.xyArrowX}>
        <View style={[styles.arrowLine, { width: '100%', height: 2 }]} />
        <View style={styles.arrowHeadRight} />
      </View>
      <View
        ref={containerRef}
        style={styles.xyGrid}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <React.Fragment key={i}>
            <View style={[styles.xyGridLineH, { top: `${i * 16.66}%` }]} />
            <View style={[styles.xyGridLineV, { left: `${i * 16.66}%` }]} />
          </React.Fragment>
        ))}
        {tasks.map((task) => (
          <View key={task.id} style={[styles.xyTaskWrapper, { left: `${task.x}%`, top: `${100 - task.y}%` }]}>
            <StickyNote
              task={task}
              onDrag={(t, g, e) => handleDrag(t, g, e)}
              onLongPress={onLongPress}
              onDelete={onDelete}
              isEditing={editingId === task.id}
              onEditComplete={onEditComplete}
              editText={editText}
              setEditText={setEditText}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

// ============================================
// カンバンモード
// ============================================

const KanbanView = ({ tasks, labels, onDrag, onLongPress, onDelete, editingId, onEditComplete, editText, setEditText }) => {
  const columns = ['col1', 'col2', 'col3'];
  const columnLayouts = useRef({});

  const getColumnTasks = (col) => tasks.filter(t => t.column === col).sort((a, b) => (a.kanbanOrder || 0) - (b.kanbanOrder || 0));

  const handleDrag = (task, gestureState, nativeEvent) => {
    const dropX = nativeEvent.pageX;
    for (const [col, layout] of Object.entries(columnLayouts.current)) {
      if (layout && dropX >= layout.x && dropX <= layout.x + layout.width) {
        if (task.column !== col) {
          const maxOrder = Math.max(0, ...tasks.filter(t => t.column === col).map(t => t.kanbanOrder || 0));
          onDrag(task.id, { column: col, kanbanOrder: maxOrder + 1 });
        }
        break;
      }
    }
  };

  return (
    <View style={styles.kanbanContainer}>
      {columns.map((col) => (
        <View
          key={col}
          style={styles.kanbanColumn}
          onLayout={(e) => {
            e.target.measure((x, y, width, height, pageX, pageY) => {
              columnLayouts.current[col] = { x: pageX, y: pageY, width, height };
            });
          }}
        >
          <View style={styles.kanbanHeader}>
            <Text style={styles.kanbanTitle}>{labels[col]}</Text>
            <View style={styles.kanbanCount}>
              <Text style={styles.kanbanCountText}>{tasks.filter(t => t.column === col).length}</Text>
            </View>
          </View>
          <ScrollView style={styles.kanbanTasks} showsVerticalScrollIndicator={false}>
            {getColumnTasks(col).map((task) => (
              <View key={task.id} style={styles.kanbanTaskWrapper}>
                <StickyNote
                  task={task}
                  onDrag={(t, g, e) => handleDrag(t, g, e)}
                  onLongPress={onLongPress}
                  onDelete={onDelete}
                  isEditing={editingId === task.id}
                  onEditComplete={onEditComplete}
                  editText={editText}
                  setEditText={setEditText}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

// ============================================
// 4分割モード
// ============================================

const QuadrantView = ({ tasks, labels, onLabelChange, onDrag, onLongPress, onDelete, editingId, onEditComplete, editText, setEditText }) => {
  const quadrants = ['q1', 'q2', 'q3', 'q4'];
  const quadrantLayouts = useRef({});

  const getQuadrantTasks = (q) => tasks.filter(t => t.quadrant === q).sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleDrag = (task, gestureState, nativeEvent) => {
    const dropX = nativeEvent.pageX;
    const dropY = nativeEvent.pageY;
    for (const [q, layout] of Object.entries(quadrantLayouts.current)) {
      if (layout && dropX >= layout.x && dropX <= layout.x + layout.width && dropY >= layout.y && dropY <= layout.y + layout.height) {
        if (task.quadrant !== q) {
          const maxOrder = Math.max(0, ...tasks.filter(t => t.quadrant === q).map(t => t.order || 0));
          onDrag(task.id, { quadrant: q, order: maxOrder + 1 });
        }
        break;
      }
    }
  };

  const quadrantStyles = {
    q1: [styles.quadrantCell, styles.quadrantQ1],
    q2: [styles.quadrantCell, styles.quadrantQ2],
    q3: [styles.quadrantCell, styles.quadrantQ3],
    q4: [styles.quadrantCell, styles.quadrantQ4],
  };

  return (
    <View style={styles.quadrantContainer}>
      <Text style={[styles.quadrantLabel, styles.quadrantLabelTop]}>{labels.axisTop}</Text>
      <Text style={[styles.quadrantLabel, styles.quadrantLabelBottom]}>{labels.axisBottom}</Text>
      <Text style={[styles.quadrantLabel, styles.quadrantLabelLeft]}>{labels.axisLeft}</Text>
      <Text style={[styles.quadrantLabel, styles.quadrantLabelRight]}>{labels.axisRight}</Text>
      <View style={styles.quadrantGrid}>
        {/* Row 1: q2, q1 */}
        <View style={styles.quadrantRow}>
          {['q2', 'q1'].map((q) => (
            <View
              key={q}
              style={quadrantStyles[q]}
              onLayout={(e) => {
                e.target.measure((x, y, width, height, pageX, pageY) => {
                  quadrantLayouts.current[q] = { x: pageX, y: pageY, width, height };
                });
              }}
            >
              <EditableLabel value={labels[q]} onChange={(val) => onLabelChange('quadrant', q, val)} style={styles.quadrantCellLabel} />
              <ScrollView style={styles.quadrantTasks} showsVerticalScrollIndicator={false}>
                {getQuadrantTasks(q).map((task) => (
                  <View key={task.id} style={styles.quadrantTaskWrapper}>
                    <StickyNote
                      task={task}
                      onDrag={(t, g, e) => handleDrag(t, g, e)}
                      onLongPress={onLongPress}
                      onDelete={onDelete}
                      isEditing={editingId === task.id}
                      onEditComplete={onEditComplete}
                      editText={editText}
                      setEditText={setEditText}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
        {/* Row 2: q4, q3 */}
        <View style={styles.quadrantRow}>
          {['q4', 'q3'].map((q) => (
            <View
              key={q}
              style={quadrantStyles[q]}
              onLayout={(e) => {
                e.target.measure((x, y, width, height, pageX, pageY) => {
                  quadrantLayouts.current[q] = { x: pageX, y: pageY, width, height };
                });
              }}
            >
              <EditableLabel value={labels[q]} onChange={(val) => onLabelChange('quadrant', q, val)} style={styles.quadrantCellLabel} />
              <ScrollView style={styles.quadrantTasks} showsVerticalScrollIndicator={false}>
                {getQuadrantTasks(q).map((task) => (
                  <View key={task.id} style={styles.quadrantTaskWrapper}>
                    <StickyNote
                      task={task}
                      onDrag={(t, g, e) => handleDrag(t, g, e)}
                      onLongPress={onLongPress}
                      onDelete={onDelete}
                      isEditing={editingId === task.id}
                      onEditComplete={onEditComplete}
                      editText={editText}
                      setEditText={setEditText}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
        <View style={styles.quadrantAxisH} />
        <View style={styles.quadrantAxisV} />
      </View>
    </View>
  );
};

// ============================================
// モード切替
// ============================================

const ModeToggle = ({ currentMode, onModeChange }) => (
  <View style={styles.modeToggle}>
    <TouchableOpacity style={[styles.modeButton, currentMode === MODES.XY && styles.modeButtonActive]} onPress={() => onModeChange(MODES.XY)}>
      <View style={styles.modeIconXY}>
        <View style={styles.modeIconXYLine} />
        <View style={[styles.modeIconXYDot, { left: 8, top: 12 }]} />
        <View style={[styles.modeIconXYDot, { left: 16, top: 6 }]} />
      </View>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.modeButton, currentMode === MODES.KANBAN && styles.modeButtonActive]} onPress={() => onModeChange(MODES.KANBAN)}>
      <View style={styles.modeIconKanban}>
        <View style={[styles.modeIconKanbanCol, { height: 18 }]} />
        <View style={[styles.modeIconKanbanCol, { height: 12 }]} />
        <View style={[styles.modeIconKanbanCol, { height: 8 }]} />
      </View>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.modeButton, currentMode === MODES.QUADRANT && styles.modeButtonActive]} onPress={() => onModeChange(MODES.QUADRANT)}>
      <View style={styles.modeIconQuadrant}>
        <View style={styles.modeIconQuadrantCell} />
        <View style={styles.modeIconQuadrantCell} />
        <View style={styles.modeIconQuadrantCell} />
        <View style={styles.modeIconQuadrantCell} />
      </View>
    </TouchableOpacity>
  </View>
);

// ============================================
// カラーピッカー
// ============================================

const ColorPicker = ({ visible, selectedColor, onSelect, onClose }) => {
  const t = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.colorPickerOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.colorPicker}>
          <Text style={styles.colorPickerTitle}>{t('selectColor')}</Text>
          <View style={styles.colorOptions}>
            {STICKY_COLORS.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[styles.colorOption, { backgroundColor: color.bg, borderColor: selectedColor === color.id ? '#3D3328' : color.border }]}
                onPress={() => onSelect(color.id)}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================
// メインアプリ
// ============================================

function AppContent({ lang }) {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState(() => getInitialTasks(lang));
  const [currentMode, setCurrentMode] = useState(MODES.QUADRANT);
  const [labels, setLabels] = useState(() => getDefaultLabels(lang));
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newTaskColor, setNewTaskColor] = useState('cream');
  const nextId = useRef(6);

  useEffect(() => {
    const loadData = async () => {
      const savedTasks = await Storage.get('sticrix_tasks');
      const savedLabels = await Storage.get('sticrix_labels');
      const savedMode = await Storage.get('sticrix_mode');
      const savedNextId = await Storage.get('sticrix_nextId');
      if (savedTasks) setTasks(savedTasks);
      if (savedLabels) setLabels(prev => ({ ...prev, ...savedLabels }));
      if (savedMode) setCurrentMode(savedMode);
      if (savedNextId) nextId.current = savedNextId;
    };
    loadData();
  }, []);

  useEffect(() => {
    Storage.set('sticrix_tasks', tasks);
    Storage.set('sticrix_labels', labels);
    Storage.set('sticrix_mode', currentMode);
    Storage.set('sticrix_nextId', nextId.current);
  }, [tasks, labels, currentMode]);

  const handleDrag = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const handleLabelChange = useCallback((mode, key, value) => {
    setLabels(prev => ({ ...prev, [mode]: { ...prev[mode], [key]: value } }));
  }, []);

  const handleLongPress = useCallback((id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditText(task.text);
      setEditingId(id);
    }
  }, [tasks]);

  const handleEditComplete = useCallback((id, newText) => {
    if (newText.trim()) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, text: newText.trim() } : t));
    }
    setEditingId(null);
    setEditText('');
  }, []);

  const handleDelete = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleAddTask = useCallback(() => {
    const newTask = {
      id: nextId.current++,
      text: t('newTask'),
      color: newTaskColor,
      x: 50,
      y: 50,
      column: 'col1',
      quadrant: 'q1',
      order: Date.now(),
      kanbanOrder: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
    setEditText(newTask.text);
    setEditingId(newTask.id);
  }, [newTaskColor, t]);

  const viewProps = {
    tasks,
    labels: labels[currentMode === MODES.XY ? 'xy' : currentMode === MODES.KANBAN ? 'kanban' : 'quadrant'],
    onLabelChange: handleLabelChange,
    onDrag: handleDrag,
    onLongPress: handleLongPress,
    onDelete: handleDelete,
    editingId,
    onEditComplete: handleEditComplete,
    editText,
    setEditText,
  };

  return (
    <LinearGradient colors={['#FDFBF7', '#F8F4EC']} style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('appTitle')}</Text>
        <ModeToggle currentMode={currentMode} onModeChange={setCurrentMode} />
      </View>

      <View style={styles.main}>
        {currentMode === MODES.XY && <XYAxisView {...viewProps} />}
        {currentMode === MODES.KANBAN && <KanbanView {...viewProps} />}
        {currentMode === MODES.QUADRANT && <QuadrantView {...viewProps} />}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.colorButton, { backgroundColor: STICKY_COLORS.find(c => c.id === newTaskColor)?.bg }]}
          onPress={() => setShowColorPicker(true)}
        />
      </View>


      <ColorPicker
        visible={showColorPicker}
        selectedColor={newTaskColor}
        onSelect={(color) => { setNewTaskColor(color); setShowColorPicker(false); }}
        onClose={() => setShowColorPicker(false)}
      />
    </LinearGradient>
  );
}

export default function App() {
  const [lang] = useState(getLanguage);

  return (
    <SafeAreaProvider>
      <LanguageContext.Provider value={lang}>
        <AppContent lang={lang} />
      </LanguageContext.Provider>
    </SafeAreaProvider>
  );
}

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 22,
    fontWeight: '700',
    color: '#3D3328',
    letterSpacing: -0.5,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeIconXY: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  modeIconXYLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 2,
    height: 18,
    backgroundColor: '#8B7355',
  },
  modeIconXYDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B7355',
  },
  modeIconKanban: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  modeIconKanbanCol: {
    width: 5,
    backgroundColor: '#8B7355',
    borderRadius: 1,
  },
  modeIconQuadrant: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 20,
    height: 20,
    gap: 2,
  },
  modeIconQuadrantCell: {
    width: 9,
    height: 9,
    backgroundColor: '#8B7355',
    borderRadius: 1,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  matrixContainer: {
    flex: 1,
    padding: 24,
    paddingLeft: 28,
    paddingBottom: 32,
  },
  xyGrid: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8DCC4',
    position: 'relative',
    overflow: 'hidden',
  },
  xyGridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E8DCC4',
    opacity: 0.5,
  },
  xyGridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E8DCC4',
    opacity: 0.5,
  },
  xyLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '500',
    color: '#8B7355',
  },
  xyLabelY: {
    left: 0,
    top: '50%',
    transform: [{ rotate: '-90deg' }, { translateX: -20 }],
  },
  xyLabelX: {
    bottom: 4,
    right: 20,
  },
  xyArrowY: {
    position: 'absolute',
    left: 16,
    top: 24,
    bottom: 32,
    width: 24,
    alignItems: 'center',
  },
  xyArrowX: {
    position: 'absolute',
    left: 28,
    right: 20,
    bottom: 16,
    height: 24,
    justifyContent: 'center',
  },
  arrowLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#C4B49A',
  },
  arrowHeadUp: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#C4B49A',
  },
  arrowHeadRight: {
    position: 'absolute',
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#C4B49A',
  },
  xyTaskWrapper: {
    position: 'absolute',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  kanbanContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  kanbanColumn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    padding: 12,
  },
  kanbanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E8DCC4',
    marginBottom: 12,
  },
  kanbanTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#5C4A32',
  },
  kanbanCount: {
    backgroundColor: '#E8DCC4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  kanbanCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B7355',
  },
  kanbanTasks: {
    flex: 1,
  },
  kanbanTaskWrapper: {
    marginBottom: 8,
  },
  quadrantContainer: {
    flex: 1,
    padding: 20,
    paddingLeft: 24,
  },
  quadrantGrid: {
    flex: 1,
    position: 'relative',
  },
  quadrantRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  quadrantCell: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    margin: 2,
  },
  quadrantQ1: { backgroundColor: 'rgba(255,228,232,0.4)' },
  quadrantQ2: { backgroundColor: 'rgba(232,245,233,0.4)' },
  quadrantQ3: { backgroundColor: 'rgba(255,243,224,0.4)' },
  quadrantQ4: { backgroundColor: 'rgba(245,245,245,0.4)' },
  quadrantCellLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 8,
  },
  quadrantTasks: {
    flex: 1,
  },
  quadrantTaskWrapper: {
    marginBottom: 6,
  },
  quadrantLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '600',
    color: '#A08B70',
    letterSpacing: 1,
    zIndex: 20,
  },
  quadrantLabelTop: { top: 4, left: '50%', transform: [{ translateX: -20 }] },
  quadrantLabelBottom: { bottom: 0, left: '50%', transform: [{ translateX: -20 }] },
  quadrantLabelLeft: { left: 2, top: '50%', transform: [{ rotate: '-90deg' }, { translateX: -20 }] },
  quadrantLabelRight: { right: -8, top: '50%', transform: [{ rotate: '90deg' }, { translateX: 20 }] },
  quadrantAxisH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: '#C4B49A',
    transform: [{ translateY: -1 }],
  },
  quadrantAxisV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: '#C4B49A',
    transform: [{ translateX: -1 }],
  },
  stickyNote: {
    minWidth: isTablet ? 100 : 90,
    maxWidth: isTablet ? 150 : 130,
    padding: 10,
    paddingRight: 20,
    borderRadius: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  stickyFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 16,
    borderRightWidth: 16,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  stickyText: {
    fontSize: isTablet ? 14 : 12,
    lineHeight: isTablet ? 18 : 16,
  },
  stickyEdit: {
    gap: 8,
  },
  stickyEditInput: {
    fontSize: isTablet ? 14 : 12,
    lineHeight: isTablet ? 18 : 16,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  editDoneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editDoneBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stickyDelete: {
    position: 'absolute',
    top: 2,
    right: 16,
  },
  stickyDeleteText: {
    fontSize: 16,
    fontWeight: '300',
  },
  editableLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B7355',
  },
  editableLabelInput: {
    fontSize: 11,
    fontWeight: '500',
    color: '#5C4A32',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#5C4A32',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  addButton: {
    width: isTablet ? 64 : 56,
    height: isTablet ? 64 : 56,
    borderRadius: 32,
    backgroundColor: '#5C4A32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3D3328',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#fff',
    marginTop: -2,
  },
  colorButton: {
    width: isTablet ? 52 : 44,
    height: isTablet ? 52 : 44,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  colorPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPicker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  colorPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D3328',
    textAlign: 'center',
    marginBottom: 16,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
  },
  adBanner: {
    alignItems: 'center',
    paddingVertical: 4,
  },
});
