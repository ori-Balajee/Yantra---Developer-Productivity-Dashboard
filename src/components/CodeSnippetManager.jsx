import { useState } from 'react';
import { Code, Search, Tag, Star, Trash2, Copy, Plus, Check } from 'lucide-react';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'CSS', 'HTML', 'SQL', 'JSON', 'Bash'];

export function CodeSnippetManager({ snippets, onDataRefresh }) {
    const [search, setSearch] = useState('');
    const [filterLang, setFilterLang] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        code: '',
        language: 'JavaScript',
        tags: '',
    });

    const [copiedId, setCopiedId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const filteredSnippets = snippets.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase()) ||
            s.code.toLowerCase().includes(search.toLowerCase()) ||
            s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesLang = !filterLang || s.language === filterLang;
    })
}


