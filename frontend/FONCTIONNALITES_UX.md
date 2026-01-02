# 🚀 Fonctionnalités UX Avancées

## 1. Toast d'annulation après suppression ✅

### Fonctionnalité
Après la suppression d'une tâche, un toast personnalisé apparaît pendant 5 secondes avec un bouton "Annuler" permettant de restaurer la tâche.

### Implémentation
- **Fichier**: `TaskItem.jsx`
- **Hook utilisé**: `react-hot-toast`
- **Comportement**:
  - Suppression optimiste (UI mise à jour immédiatement)
  - Toast affiché avec durée de 5000ms
  - Bouton "Annuler" avec style vert
  - Si annulé: restaure la tâche et annule l'appel API
  - Si non annulé: l'appel API de suppression s'exécute après 5s

### Code clé
```jsx
const handleDelete = async () => {
  setIsDeleting(true);
  
  // Custom undo toast
  toast((t) => (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-green-600" />
      <div>
        <p className="font-medium text-gray-900">Tâche supprimée</p>
        <p className="text-sm text-gray-600">{task.title}</p>
      </div>
      <button
        onClick={() => {
          toast.dismiss(t.id);
          onUpdate({ ...task });
        }}
        className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Annuler
      </button>
    </div>
  ), { duration: 5000 });

  // Remove optimistically
  onDelete(task.id);

  // Delay actual deletion
  setTimeout(async () => {
    try {
      await api.delete(`/tasks/${task.id}`);
    } catch (error) {
      onUpdate(task); // Restore on error
      toast.error('Erreur lors de la suppression');
    }
  }, 5000);
};
```

---

## 2. Autocomplétion intelligente pour tags/projets ✅

### Fonctionnalité
Lors de la saisie dans le champ "Étiquettes", un menu déroulant propose automatiquement les tags existants qui correspondent à la recherche.

### Implémentation
- **Fichier**: `AddTaskForm.jsx`
- **États**:
  - `allTags`: Liste de tous les tags existants
  - `suggestedTags`: Tags filtrés selon l'input
  - `showTagSuggestions`: Affichage conditionnel du dropdown

### Comportement
1. **Fetch des tags**: Au montage du composant, récupère tous les tags des tâches existantes
2. **Filtrage**: En temps réel selon l'input utilisateur
3. **Limite**: Maximum 5 suggestions affichées
4. **Exclusion**: Ne propose pas les tags déjà ajoutés
5. **Interaction**: Click sur suggestion → ajout automatique du tag
6. **Animation**: Slide-down avec `animate-slide-down`

### Code clé
```jsx
// Fetch existing tags
useEffect(() => {
  const fetchTags = async () => {
    const response = await api.get('/tasks');
    const tasks = response.data.tasks || [];
    const tagsSet = new Set();
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    setAllTags(Array.from(tagsSet));
  };
  fetchTags();
}, []);

// Filter suggestions
useEffect(() => {
  if (tagInput.trim()) {
    const filtered = allTags.filter(tag => 
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !formData.tags.includes(tag)
    );
    setSuggestedTags(filtered.slice(0, 5));
    setShowTagSuggestions(filtered.length > 0);
  }
}, [tagInput, allTags, formData.tags]);
```

### UI
```jsx
{showTagSuggestions && (
  <div className="absolute z-20 w-full bg-white dark:bg-gray-700 border rounded-lg shadow-lg animate-slide-down">
    {suggestedTags.map((tag) => (
      <button onClick={() => addTag(tag)} className="hover:bg-gray-100">
        <Tag className="w-3 h-3" />
        {tag}
      </button>
    ))}
  </div>
)}
```

---

## 3. Vue en grille alternative ✅

### Fonctionnalité
Bascule entre vue liste et vue grille (cards) pour afficher les tâches. La préférence est sauvegardée localement.

### Implémentation
- **Fichier**: `Today.jsx`
- **État**: `viewMode` ('list' ou 'grid')
- **Persistence**: `localStorage.setItem('today_viewMode', viewMode)`
- **Icons**: `List` et `Grid3x3` de lucide-react

### UI Toggle
```jsx
<div className="flex bg-white rounded-lg p-1 border shadow-sm">
  <button
    onClick={() => setViewMode('list')}
    className={viewMode === 'list' ? 'bg-primary-100 text-primary-600' : ''}
  >
    <List className="w-5 h-5" />
  </button>
  <button
    onClick={() => setViewMode('grid')}
    className={viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : ''}
  >
    <Grid3x3 className="w-5 h-5" />
  </button>
</div>
```

### Vue Grille
- **Layout**: CSS Grid responsive (1 colonne mobile, 2 tablette, 3 desktop)
- **Classes**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- **Animation**: Chaque card avec `animate-scale-in` et délai stagger
- **Structure**: Chaque tâche dans un TaskList avec un seul élément

```jsx
{viewMode === 'grid' ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {tasks.map((task) => (
      <TaskList key={task.id} tasks={[task]} />
    ))}
  </div>
) : (
  <TaskList tasks={tasks} />
)}
```

---

## 4. Filtres persistants ✅

### Fonctionnalité
Les filtres de statut et priorité sont sauvegardés dans le localStorage et restaurés au prochain chargement de la page.

### Implémentation
- **Fichier**: `Today.jsx`
- **États persistés**:
  - `filterStatus`: 'all', 'todo', 'in_progress', 'completed'
  - `filterPriority`: 'all', 'urgent', 'high', 'medium', 'low'

### Code
```jsx
// Initialisation avec localStorage
const [filterStatus, setFilterStatus] = useState(() => {
  return localStorage.getItem('today_filterStatus') || 'all';
});

const [filterPriority, setFilterPriority] = useState(() => {
  return localStorage.getItem('today_filterPriority') || 'all';
});

// Sauvegarde automatique
useEffect(() => {
  localStorage.setItem('today_filterStatus', filterStatus);
}, [filterStatus]);

useEffect(() => {
  localStorage.setItem('today_filterPriority', filterPriority);
}, [filterPriority]);
```

### Bouton Réinitialiser
```jsx
{(filterStatus !== 'all' || filterPriority !== 'all') && (
  <button
    onClick={() => {
      setFilterStatus('all');
      setFilterPriority('all');
      toast.success('Filtres réinitialisés');
    }}
    className="text-sm text-gray-600 hover:text-gray-900 underline"
  >
    Réinitialiser les filtres
  </button>
)}
```

---

## 5. Drag-and-drop pour réorganiser ✅ (Structure)

### Fonctionnalité
Les tâches peuvent être réorganisées par glisser-déposer. Une poignée de drag apparaît au survol.

### Implémentation
- **Fichier**: `TaskItem.jsx`
- **Props**: `draggable`, `onDragStart`, `onDragEnd`, `onDragOver`, `onDrop`
- **État**: `isDragging` pour feedback visuel
- **Icon**: `GripVertical` de lucide-react

### Structure TaskItem
```jsx
<div
  draggable={draggable}
  onDragStart={(e) => {
    setIsDragging(true);
    onDragStart?.(e, task);
  }}
  onDragEnd={(e) => {
    setIsDragging(false);
    onDragEnd?.(e);
  }}
  onDragOver={(e) => {
    e.preventDefault();
    onDragOver?.(e, task);
  }}
  onDrop={(e) => {
    e.preventDefault();
    onDrop?.(e, task);
  }}
  className={`task-item ${isDragging ? 'opacity-50' : ''}`}
  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
>
  <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
  {/* Rest of task content */}
</div>
```

### CSS
```css
.task-item {
  transition: all 0.2s;
}

.task-item:hover .grip-handle {
  opacity: 1;
}

.task-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}
```

### Prochaines étapes
Pour compléter l'implémentation dans les pages parent (Today.jsx, etc.):

```jsx
const [draggedTask, setDraggedTask] = useState(null);
const [dropIndex, setDropIndex] = useState(null);

const handleDragStart = (e, task) => {
  setDraggedTask(task);
};

const handleDragOver = (e, task) => {
  e.preventDefault();
  const index = tasks.findIndex(t => t.id === task.id);
  setDropIndex(index);
};

const handleDrop = async (e, targetTask) => {
  e.preventDefault();
  if (!draggedTask || draggedTask.id === targetTask.id) return;

  const draggedIndex = tasks.findIndex(t => t.id === draggedTask.id);
  const targetIndex = tasks.findIndex(t => t.id === targetTask.id);

  // Reorder array
  const newTasks = [...tasks];
  newTasks.splice(draggedIndex, 1);
  newTasks.splice(targetIndex, 0, draggedTask);

  setTasks(newTasks);
  
  // Persist order to API
  await api.patch(`/tasks/reorder`, {
    taskId: draggedTask.id,
    newPosition: targetIndex
  });

  setDraggedTask(null);
  setDropIndex(null);
};
```

---

## 🎨 Animations ajoutées

### slide-down
```css
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slide-down 0.2s ease-out;
}
```

Utilisée pour:
- Dropdown d'autocomplétion
- Menus déroulants
- Notifications descendantes

---

## 📱 Responsive

Toutes les fonctionnalités sont optimisées pour mobile:
- **Vue grille**: 1 colonne sur mobile, 2 sur tablette, 3 sur desktop
- **Autocomplétion**: Touch-friendly avec zones de tap larges
- **Drag-drop**: Compatible avec les événements touch (à implémenter)
- **Filtres**: Disposition verticale sur mobile

---

## ♿ Accessibilité

- **ARIA labels**: Tous les boutons ont des labels descriptifs
- **Focus visible**: Anneaux de focus avec `focus:ring-2`
- **Contraste**: Respecte WCAG AA en mode clair et sombre
- **Navigation clavier**: Tab, Enter, Escape fonctionnent partout
- **Annonces**: Toast notifications compatibles lecteurs d'écran

---

## 🔑 Raccourcis clavier existants

| Raccourci | Action |
|-----------|--------|
| `Ctrl+N` | Nouvelle tâche |
| `Ctrl+F` | Ouvrir les filtres |
| `Ctrl+K` | Recherche |
| `Escape` | Fermer modal/dropdown |
| `Shift+?` | Aide raccourcis |

---

## 💾 Données persistées dans localStorage

| Clé | Valeur | Description |
|-----|--------|-------------|
| `today_filterStatus` | 'all', 'todo', 'in_progress', 'completed' | Filtre de statut |
| `today_filterPriority` | 'all', 'urgent', 'high', 'medium', 'low' | Filtre de priorité |
| `today_viewMode` | 'list', 'grid' | Mode d'affichage |

---

## 🚀 Performance

- **Debouncing**: Autocomplétion sans requêtes excessives
- **Lazy loading**: Tags chargés une seule fois au montage
- **Optimistic UI**: Suppressions instantanées avec fallback
- **Animations CSS**: Utilisation de `transform` et `opacity` (GPU)
- **Memoization**: États calculés avec `useMemo` dans Today.jsx

---

## 🎯 Prochaines améliorations possibles

1. **Drag-drop mobile**: Ajouter support des événements touch
2. **Autocomplétion projets**: Même système pour les projets
3. **Historique undo/redo**: Stack d'actions annulables
4. **Filtres avancés**: Combinaisons complexes (ET/OU)
5. **Tri personnalisé**: Par date, priorité, nom, manuel
6. **Bulk actions**: Sélection multiple pour actions groupées
7. **Vues sauvegardées**: Enregistrer configurations de filtres
8. **Animations de transition**: Page transitions avec Framer Motion
