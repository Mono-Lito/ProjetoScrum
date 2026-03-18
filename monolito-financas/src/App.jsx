import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Trash2,
  Wallet,
  Landmark,
  Receipt,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Calendar,
  Clock,
  Star,
  CreditCard,
  RefreshCw,
  Flag,
  LineChart as LineChartIcon,
} from "lucide-react";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const CATEGORIES = {
  receitas: {
    id: "receitas",
    title: "Receitas (O que entra)",
    icon: TrendingUp,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  fixas: {
    id: "fixas",
    title: "Despesas Fixas",
    icon: Wallet,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  variaveis: {
    id: "variaveis",
    title: "Contas do Mês",
    icon: Receipt,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  parcelados: {
    id: "parcelados",
    title: "Compras Parceladas",
    icon: CreditCard,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  impostos: {
    id: "impostos",
    title: "Impostos",
    icon: Landmark,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  objetivos: {
    id: "objetivos",
    title: "Objetivos Financeiros",
    icon: Target,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
};

const generateInitialState = () => {
  const year = new Date().getFullYear().toString();
  return {
    [year]: {
      Janeiro: {
        receitas: [{ id: "1", description: "Salário Exemplo", value: 5000 }],
        fixas: [{ id: "2", description: "Aluguel Exemplo", value: 1500 }],
        variaveis: [{ id: "3", description: "Mercado Exemplo", value: 800 }],
        parcelados: [
          { id: "4", description: "Playstation (1/4)", value: 550.59 },
        ],
        impostos: [],
        objetivos: [],
      },
    },
  };
};

export default function App() {
  const [view, setView] = useState("home");
  const [activeYear, setActiveYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [activeMonth, setActiveMonth] = useState("Janeiro");

  const today = new Date();
  const realCurrentMonth = MONTHS[today.getMonth()];
  const realCurrentYear = today.getFullYear().toString();

  // Estados principais
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("monolito_data");
    return savedData ? JSON.parse(savedData) : generateInitialState();
  });

  const [baseSalary, setBaseSalary] = useState(() => {
    const savedSalary = localStorage.getItem("monolito_base_salary");
    return savedSalary || "5000";
  });

  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem("monolito_goals");
    return savedGoals ? JSON.parse(savedGoals) : [];
  });

  // Estados de formulário
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newMonth, setNewMonth] = useState(MONTHS[new Date().getMonth()]);

  // Estados para nova Meta
  const [goalName, setGoalName] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Persistência
  useEffect(() => {
    localStorage.setItem("monolito_data", JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    localStorage.setItem("monolito_base_salary", baseSalary);
  }, [baseSalary]);
  useEffect(() => {
    localStorage.setItem("monolito_goals", JSON.stringify(goals));
  }, [goals]);

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m] = val.split("-");
    setNewYear(y);
    setNewMonth(MONTHS[parseInt(m, 10) - 1]);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getMonthIndex = (y, m) => parseInt(y) * 12 + MONTHS.indexOf(m);

  // --- LÓGICA DE NAVEGAÇÃO ---
  const openMonth = (year, month) => {
    setActiveYear(year);
    setActiveMonth(month);
    setView("dashboard");
  };

  // --- LÓGICA DE METAS (GOALS) ---
  const addGoal = (e) => {
    e.preventDefault();
    if (!goalName || !goalValue || !goalDeadline) return;

    const [y, m] = goalDeadline.split("-");
    const deadlineIdx = parseInt(y) * 12 + (parseInt(m) - 1);
    const startIdx = today.getFullYear() * 12 + today.getMonth();

    const monthsDiff = deadlineIdx - startIdx + 1;
    const monthsToSave = monthsDiff > 0 ? monthsDiff : 1;
    const monthlyValue = parseFloat(goalValue) / monthsToSave;

    const newGoal = {
      id: Math.random().toString(36).substr(2, 9),
      name: goalName,
      totalValue: parseFloat(goalValue),
      monthlyValue: monthlyValue,
      deadlineMonth: MONTHS[parseInt(m) - 1],
      deadlineYear: y,
      deadlineIdx: deadlineIdx,
      startIdx: startIdx,
    };

    setGoals([...goals, newGoal]);
    setGoalName("");
    setGoalValue("");
    setGoalDeadline("");
  };

  const removeGoal = (id) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  // --- LÓGICA DE CRIAÇÃO E SYNC ---
  const handleCreateMonth = (e) => {
    e.preventDefault();
    if (data[newYear] && data[newYear][newMonth]) {
      openMonth(newYear, newMonth);
      return;
    }

    const targetIdx = getMonthIndex(newYear, newMonth);

    // Procura o anterior cronológico
    const allDates = [];
    Object.keys(data).forEach((y) =>
      Object.keys(data[y]).forEach((m) =>
        allDates.push({ y, m, idx: getMonthIndex(y, m) }),
      ),
    );
    const closestPast = allDates
      .filter((d) => d.idx < targetIdx)
      .sort((a, b) => b.idx - a.idx)[0];

    const copyCategory = (items) =>
      items.map((item) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
      }));

    let baseData;
    if (closestPast) {
      const prevData = data[closestPast.y][closestPast.m];
      const diff = targetIdx - closestPast.idx;

      baseData = {
        receitas: copyCategory(prevData.receitas),
        fixas: copyCategory(prevData.fixas),
        variaveis: copyCategory(prevData.variaveis),
        impostos: copyCategory(prevData.impostos),
        // CORREÇÃO: Filtrar objetivos que começam com "Meta: " para evitar duplicidade ao clonar
        objetivos: (prevData.objetivos || [])
          .filter((item) => !item.description.startsWith("Meta: "))
          .map((item) => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9),
          })),
        parcelados: (prevData.parcelados || [])
          .map((item) => {
            const match = item.description.match(/(.*)\((\d+)\/(\d+)\)/);
            if (match) {
              const name = match[1].trim(),
                current = parseInt(match[2]),
                total = parseInt(match[3]);
              const nextVal = current + diff;
              return nextVal <= total
                ? {
                    ...item,
                    id: Math.random().toString(36).substr(2, 9),
                    description: `${name} (${nextVal}/${total})`,
                  }
                : null;
            }
            return null;
          })
          .filter(Boolean),
      };
    } else {
      baseData = {
        receitas:
          baseSalary && !isNaN(parseFloat(baseSalary))
            ? [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  description: "Salário Base",
                  value: parseFloat(baseSalary),
                },
              ]
            : [],
        fixas: [],
        variaveis: [],
        parcelados: [],
        impostos: [],
        objetivos: [],
      };
    }

    // Injeção de Metas Ativas (Apenas uma vez)
    goals.forEach((goal) => {
      if (targetIdx >= goal.startIdx && targetIdx <= goal.deadlineIdx) {
        baseData.objetivos.push({
          id: `goal-${goal.id}`,
          description: `Meta: ${goal.name}`,
          value: goal.monthlyValue,
        });
      }
    });

    setData((prev) => ({
      ...prev,
      [newYear]: { ...(prev[newYear] || {}), [newMonth]: baseData },
    }));
    openMonth(newYear, newMonth);
  };

  const syncInstallments = () => {
    const currentVal = getMonthIndex(activeYear, activeMonth);
    const pastInstallments = [];

    Object.keys(data).forEach((y) => {
      Object.keys(data[y]).forEach((m) => {
        const val = getMonthIndex(y, m);
        if (val < currentVal) {
          (data[y][m].parcelados || []).forEach((item) => {
            const match = item.description.match(/(.*)\((\d+)\/(\d+)\)/);
            if (match) {
              const name = match[1].trim(),
                current = parseInt(match[2]),
                total = parseInt(match[3]);
              const diff = currentVal - val;
              const newVal = current + diff;
              if (newVal <= total) {
                pastInstallments.push({
                  name,
                  newDescription: `${name} (${newVal}/${total})`,
                  value: item.value,
                });
              }
            }
          });
        }
      });
    });

    const currentItems = data[activeYear][activeMonth].parcelados.map(
      (i) => i.description,
    );
    const toAdd = [];
    const seen = new Set();

    pastInstallments.reverse().forEach((item) => {
      if (!seen.has(item.name) && !currentItems.includes(item.newDescription)) {
        toAdd.push({
          id: Math.random().toString(36).substr(2, 9),
          description: item.newDescription,
          value: item.value,
        });
        seen.add(item.name);
      }
    });

    if (toAdd.length > 0) {
      setData((prev) => ({
        ...prev,
        [activeYear]: {
          ...prev[activeYear],
          [activeMonth]: {
            ...prev[activeYear][activeMonth],
            parcelados: [...prev[activeYear][activeMonth].parcelados, ...toAdd],
          },
        },
      }));
    }
  };

  const calculateTotal = (category, y = activeYear, m = activeMonth) => {
    if (!data[y] || !data[y][m]) return 0;
    return data[y][m][category].reduce(
      (acc, curr) => acc + Number(curr.value),
      0,
    );
  };

  const getMonthSummary = (y, m) => {
    const rec = calculateTotal("receitas", y, m);
    const desp =
      calculateTotal("fixas", y, m) +
      calculateTotal("variaveis", y, m) +
      calculateTotal("parcelados", y, m) +
      calculateTotal("impostos", y, m) +
      calculateTotal("objetivos", y, m);
    return { rec, desp, saldo: rec - desp };
  };

  const {
    rec: totalReceitas,
    desp: totalDespesas,
    saldo,
  } = getMonthSummary(activeYear, activeMonth);

  const handleAddItem = (category, description, value) => {
    if (!description || !value) return;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      value: parseFloat(value),
    };
    setData((prev) => ({
      ...prev,
      [activeYear]: {
        ...prev[activeYear],
        [activeMonth]: {
          ...prev[activeYear][activeMonth],
          [category]: [...prev[activeYear][activeMonth][category], newItem],
        },
      },
    }));
  };

  const handleRemoveItem = (category, id) => {
    setData((prev) => ({
      ...prev,
      [activeYear]: {
        ...prev[activeYear],
        [activeMonth]: {
          ...prev[activeYear][activeMonth],
          [category]: prev[activeYear][activeMonth][category].filter(
            (item) => item.id !== id,
          ),
        },
      },
    }));
  };

  // --- COMPONENTES DE UI ---
  const CategorySection = ({ categoryKey }) => {
    const categoryInfo = CATEGORIES[categoryKey];
    const items = data[activeYear]?.[activeMonth]?.[categoryKey] || [];
    const [desc, setDesc] = useState("");
    const [val, setVal] = useState("");
    const [curP, setCurP] = useState("1");
    const [totP, setTotP] = useState("");

    const onSubmit = (e) => {
      e.preventDefault();
      const finalDesc =
        categoryKey === "parcelados" && totP
          ? `${desc} (${curP}/${totP})`
          : desc;
      handleAddItem(categoryKey, finalDesc, val);
      setDesc("");
      setVal("");
      setCurP("1");
      setTotP("");
    };

    return (
      <div className='bg-[#111111] rounded-2xl border border-neutral-800/50 overflow-hidden flex flex-col h-full hover:bg-[#141414] transition-colors'>
        <div className='p-5 border-b border-neutral-800/50 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className={`p-2 rounded-lg ${categoryInfo.bg}`}>
              <categoryInfo.icon className={`w-5 h-5 ${categoryInfo.color}`} />
            </div>
            <h3 className='font-bold text-yellow-500 uppercase tracking-wider text-xs'>
              {categoryInfo.title}
            </h3>
          </div>
          <div className='flex items-center gap-3'>
            {categoryKey === "parcelados" && items.length === 0 && (
              <button
                onClick={syncInstallments}
                className='flex items-center gap-1 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-400 py-1 px-2 rounded-lg transition-colors font-bold uppercase'>
                <RefreshCw className='w-3 h-3' /> Sinc.
              </button>
            )}
            <span className='font-bold text-white'>
              {formatCurrency(calculateTotal(categoryKey))}
            </span>
          </div>
        </div>
        <div className='p-5 flex-1 overflow-y-auto min-h-[150px]'>
          {items.length === 0 ? (
            <div className='h-full flex items-center justify-center text-neutral-600 text-sm italic'>
              Vazio
            </div>
          ) : (
            <ul className='space-y-4'>
              {items.map((item) => (
                <li
                  key={item.id}
                  className='flex items-center justify-between group'>
                  <span className='text-neutral-300 text-sm font-medium'>
                    {item.description}
                  </span>
                  <div className='flex items-center gap-4'>
                    <span className='font-bold text-white text-sm'>
                      {formatCurrency(item.value)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(categoryKey, item.id)}
                      className='text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100'>
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className='p-4 bg-[#0a0a0a] border-t border-neutral-800/50'>
          <form onSubmit={onSubmit} className='flex flex-col gap-2'>
            <input
              type='text'
              placeholder={
                categoryKey === "parcelados" ? "Playstation" : "Descrição"
              }
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className='w-full bg-[#111111] border border-neutral-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-yellow-500/50'
            />
            <div className='flex gap-2 items-center'>
              {categoryKey === "parcelados" && (
                <div className='flex items-center gap-1 bg-[#111111] border border-neutral-800 rounded-xl px-2'>
                  <input
                    type='number'
                    min='1'
                    value={curP}
                    onChange={(e) => setCurP(e.target.value)}
                    className='w-8 bg-transparent text-white py-2 text-center text-sm focus:outline-none'
                  />
                  <span className='text-neutral-600 font-bold'>/</span>
                  <input
                    type='number'
                    placeholder='Total'
                    min='1'
                    value={totP}
                    onChange={(e) => setTotP(e.target.value)}
                    className='w-10 bg-transparent text-white py-2 text-center text-sm focus:outline-none'
                  />
                </div>
              )}
              <input
                type='number'
                step='0.01'
                placeholder='R$ 0,00'
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className='flex-1 bg-[#111111] border border-neutral-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-yellow-500/50'
              />
              <button
                type='submit'
                disabled={!desc || !val}
                className='bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-xl'>
                <Plus className='w-5 h-5' />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- HOME VIEW ---
  if (view === "home") {
    const allMonthsData = [];
    Object.keys(data)
      .sort()
      .forEach((y) => {
        Object.keys(data[y])
          .sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b))
          .forEach((m) => {
            const { saldo: bal } = getMonthSummary(y, m);
            allMonthsData.push({
              label: `${m.substring(0, 3)}/${y.substring(2)}`,
              fullName: `${m} ${y}`,
              balance: bal,
              rawM: m,
              rawY: y,
            });
          });
      });

    const maxAbs = Math.max(
      ...allMonthsData.map((d) => Math.abs(d.balance)),
      100,
    );
    const latest = (() => {
      const yS = Object.keys(data).sort((a, b) => b - a);
      if (!yS.length) return null;
      for (const y of yS) {
        const mS = Object.keys(data[y]).sort(
          (a, b) => MONTHS.indexOf(b) - MONTHS.indexOf(a),
        );
        if (mS.length) return { y, m: mS[0], data: data[y][mS[0]] };
      }
      return null;
    })();

    return (
      <div className='min-h-screen bg-black font-sans text-white pb-12'>
        <header className='bg-[#0a0a0a] border-b border-neutral-900 sticky top-0 z-10'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3'>
            <div className='bg-yellow-500 p-2 rounded-lg'>
              <DollarSign className='w-6 h-6 text-black' />
            </div>
            <div className='flex flex-col'>
              <span className='text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-none mb-1'>
                Bem-vindo ao
              </span>
              <span className='uppercase tracking-wide leading-none text-base font-bold'>
                Monolito Financias
              </span>
            </div>
          </div>
        </header>

        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12'>
            <div className='bg-[#111111] border border-neutral-800/50 rounded-2xl p-6 flex flex-col justify-between'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='p-3 bg-yellow-500/10 rounded-xl'>
                  <DollarSign className='w-6 h-6 text-yellow-500' />
                </div>
                <h2 className='text-sm font-bold text-white uppercase tracking-wider'>
                  Renda Base
                </h2>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-neutral-500 font-bold text-lg'>R$</span>
                <input
                  type='number'
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  className='flex-1 bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-3 font-bold text-lg focus:outline-none'
                />
              </div>
            </div>

            <div className='lg:col-span-2 bg-[#111111] border border-neutral-800/50 rounded-2xl p-6'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='p-3 bg-emerald-500/10 rounded-xl'>
                  <Flag className='w-6 h-6 text-emerald-500' />
                </div>
                <h2 className='text-sm font-bold text-white uppercase tracking-wider'>
                  Projectos e Metas de Poupança
                </h2>
              </div>
              <form
                onSubmit={addGoal}
                className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
                <input
                  type='text'
                  placeholder='Nome da Meta'
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className='sm:col-span-1 bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none'
                />
                <input
                  type='number'
                  placeholder='Valor Total R$'
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  className='bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none'
                />
                <input
                  type='month'
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className='bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none [color-scheme:dark]'
                />
                <button
                  type='submit'
                  className='bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-2 flex items-center justify-center gap-2 transition-colors'>
                  <Plus className='w-4 h-4' /> Criar Meta
                </button>
              </form>
            </div>
          </div>

          <div className='flex flex-col md:flex-row gap-8 items-start mb-12'>
            <div className='w-full md:w-80 lg:w-96 flex-shrink-0 md:sticky md:top-24 space-y-6'>
              <div className='bg-[#111111] border border-neutral-800/50 rounded-2xl p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <Calendar className='w-5 h-5 text-yellow-500' />
                  <h2 className='text-xs font-bold text-yellow-500 uppercase tracking-widest'>
                    Novo Período
                  </h2>
                </div>
                <form
                  onSubmit={handleCreateMonth}
                  className='flex flex-col gap-5'>
                  <input
                    type='month'
                    value={`${newYear}-${(MONTHS.indexOf(newMonth) + 1).toString().padStart(2, "0")}`}
                    onChange={handleDateChange}
                    className='w-full bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-4 text-lg focus:outline-none [color-scheme:dark]'
                    required
                  />
                  <button
                    type='submit'
                    className='w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-sm py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/10'>
                    Criar / Abrir
                  </button>
                </form>
              </div>

              {latest && (
                <div className='bg-[#111111] border border-neutral-800/50 rounded-2xl p-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <Clock className='w-5 h-5 text-neutral-500' />
                    <h2 className='text-xs font-bold text-neutral-500 uppercase tracking-widest'>
                      Último Arquivo
                    </h2>
                  </div>
                  <div
                    onClick={() => openMonth(latest.y, latest.m)}
                    className='p-4 bg-[#0a0a0a] border border-neutral-800 rounded-xl hover:border-yellow-500/50 transition-all cursor-pointer group'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='font-bold text-white group-hover:text-yellow-500'>
                        {latest.m} {latest.y}
                      </span>
                      <ArrowRight className='w-4 h-4 text-neutral-600 group-hover:text-yellow-500' />
                    </div>
                    <p className='text-[10px] text-neutral-500'>
                      Clique para abrir rapidamente o último mês ativo.
                    </p>
                  </div>
                </div>
              )}

              <div className='bg-[#111111] border border-neutral-800/50 rounded-2xl p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <Target className='w-5 h-5 text-emerald-500' />
                  <h2 className='text-xs font-bold text-emerald-500 uppercase tracking-widest'>
                    Metas em Curso
                  </h2>
                </div>
                <div className='space-y-4'>
                  {goals.length === 0 ? (
                    <p className='text-xs text-neutral-600 italic'>
                      Nenhuma meta ativa.
                    </p>
                  ) : (
                    goals.map((g) => (
                      <div
                        key={g.id}
                        className='bg-black/40 border border-neutral-800 p-3 rounded-xl group'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <p className='text-xs font-bold text-white uppercase'>
                              {g.name}
                            </p>
                            <p className='text-[10px] text-neutral-500'>
                              Guardar {formatCurrency(g.monthlyValue)}/mês
                            </p>
                          </div>
                          <button
                            onClick={() => removeGoal(g.id)}
                            className='text-neutral-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100'>
                            <Trash2 className='w-3 h-3' />
                          </button>
                        </div>
                        <p className='text-[9px] text-neutral-600 mt-2 uppercase text-right'>
                          Até {g.deadlineMonth} {g.deadlineYear}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className='flex-1 w-full min-w-0'>
              <h2 className='text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6'>
                Arquivos Salvos
              </h2>
              <div className='space-y-8'>
                {Object.keys(data)
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <div
                      key={year}
                      className='bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-6'>
                      <h3 className='text-xl font-bold text-white mb-6 flex items-center gap-3'>
                        <FolderOpen className='w-6 h-6 text-yellow-500' />
                        {year}
                      </h3>
                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        {Object.keys(data[year])
                          .sort((a, b) => MONTHS.indexOf(b) - MONTHS.indexOf(a))
                          .map((month) => {
                            const {
                              rec: rT,
                              desp: dT,
                              saldo: sM,
                            } = getMonthSummary(year, month);
                            const isCurr =
                              month === realCurrentMonth &&
                              year === realCurrentYear;
                            return (
                              <div
                                key={month}
                                onClick={() => openMonth(year, month)}
                                className={`bg-[#111111] border rounded-2xl p-5 cursor-pointer transition-all group flex flex-col gap-4 overflow-hidden relative ${isCurr ? "border-yellow-500/80 ring-1 ring-yellow-500/20 shadow-lg shadow-yellow-500/5" : "border-neutral-800 hover:border-yellow-500/50 hover:bg-[#141414]"}`}>
                                {isCurr && (
                                  <div className='absolute top-2 right-2 flex items-center gap-1 bg-yellow-500 text-black px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter animate-pulse'>
                                    <Star className='w-2 h-2 fill-black' />
                                    Atual
                                  </div>
                                )}
                                <div className='flex justify-between items-center'>
                                  <span
                                    className={`font-bold text-lg ${isCurr ? "text-yellow-500" : "text-white"}`}>
                                    {month}
                                  </span>
                                  <ArrowRight className='w-5 h-5 text-neutral-600 group-hover:text-yellow-500' />
                                </div>
                                <div className='flex flex-col gap-2'>
                                  <div className='flex justify-between items-center text-xs'>
                                    <span className='text-emerald-500 font-bold'>
                                      {formatCurrency(rT)}
                                    </span>
                                    <span className='text-red-500 font-bold'>
                                      {formatCurrency(dT)}
                                    </span>
                                  </div>
                                  <div className='w-full h-px bg-neutral-800'></div>
                                  <div className='flex justify-between items-center text-xs'>
                                    <span className='text-neutral-500 font-bold uppercase text-[10px]'>
                                      Saldo Final
                                    </span>
                                    <span
                                      className={`font-bold ${sM >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                      {formatCurrency(sM)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className='mt-12 bg-[#111111] border border-neutral-800/50 rounded-2xl p-6 sm:p-8'>
            <div className='flex items-center gap-3 mb-10'>
              <LineChartIcon className='w-5 h-5 text-yellow-500' />
              <h2 className='text-xs font-bold text-yellow-500 uppercase tracking-widest'>
                Evolução do Saldo (Trend Line)
              </h2>
            </div>
            <div className='relative w-full overflow-x-auto pb-4 custom-scrollbar'>
              <div className='min-w-[850px] h-72 relative flex items-center pr-10'>
                <div className='absolute left-[80px] right-0 h-px bg-neutral-800 top-1/2'></div>
                {allMonthsData.length > 0 &&
                  (() => {
                    const points = allMonthsData.map((d, i) => ({
                      ...d,
                      x: (i / (allMonthsData.length - 1 || 1)) * 700 + 80,
                      y: 100 - (d.balance / maxAbs) * 80,
                    }));
                    const linePath = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
                    return (
                      <svg
                        viewBox={`0 0 850 200`}
                        className='w-full h-full overflow-visible z-10'>
                        <line
                          x1='80'
                          y1='10'
                          x2='80'
                          y2='190'
                          stroke='#262626'
                          strokeWidth='2'
                        />
                        {[maxAbs, 0, -maxAbs].map((v, i) => (
                          <g key={i}>
                            <line
                              x1='80'
                              y1={100 - (v / maxAbs) * 80}
                              x2='800'
                              y2={100 - (v / maxAbs) * 80}
                              stroke='#262626'
                              strokeWidth='1'
                              strokeDasharray='4 4'
                            />
                            <text
                              x='70'
                              y={104 - (v / maxAbs) * 80}
                              textAnchor='end'
                              fill='#525252'
                              fontSize='9'
                              fontWeight='bold'>
                              {formatCurrency(v)}
                            </text>
                          </g>
                        ))}
                        <path
                          d={linePath}
                          fill='none'
                          stroke='#eab308'
                          strokeWidth='3'
                          strokeLinecap='round'
                          className='drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                        />
                        {points.map((p, i) => (
                          <g
                            key={i}
                            className='group/dot cursor-pointer'
                            onClick={() => openMonth(p.rawY, p.rawM)}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r='5'
                              fill='#111111'
                              stroke='#eab308'
                              strokeWidth='2'
                              className='transition-all group-hover/dot:r-7'
                            />
                            <text
                              x={p.x}
                              y={p.y - 12}
                              textAnchor='middle'
                              fill={p.balance >= 0 ? "#10b981" : "#ef4444"}
                              fontSize='10'
                              fontWeight='bold'
                              className='opacity-0 group-hover/dot:opacity-100 transition-opacity drop-shadow-md'>
                              {formatCurrency(p.balance)}
                            </text>
                          </g>
                        ))}
                      </svg>
                    );
                  })()}
              </div>
            </div>
          </div>
        </main>
        <style
          dangerouslySetInnerHTML={{
            __html: `.custom-scrollbar::-webkit-scrollbar { height: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }`,
          }}
        />
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className='min-h-screen bg-black font-sans text-white pb-12'>
      <header className='bg-[#0a0a0a] border-b border-neutral-900 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4'>
          <button
            onClick={() => setView("home")}
            className='flex items-center gap-2 text-neutral-400 hover:text-yellow-500 transition-colors text-sm font-bold uppercase tracking-widest'>
            <ArrowLeft className='w-5 h-5' />
            Arquivo
          </button>
          <div className='flex items-center gap-3'>
            <span className='uppercase tracking-widest text-neutral-500 text-xs hidden sm:inline-block'>
              Monolito Financias &bull;
            </span>
            <span className='font-bold text-white'>
              {activeMonth} {activeYear}
            </span>
          </div>
        </div>
      </header>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8'>
        <div className='mb-8'>
          <h2 className='text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2'>
            Visão Geral
          </h2>
          <p className='text-white text-3xl font-bold'>{activeMonth}</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-[#111111] rounded-2xl p-6 border border-neutral-800/50 flex items-center gap-5'>
            <div className='bg-emerald-500/10 p-4 rounded-xl'>
              <TrendingUp className='w-7 h-7 text-emerald-500' />
            </div>
            <div>
              <p className='text-[11px] font-bold text-neutral-500 uppercase tracking-widest'>
                Receitas
              </p>
              <h3 className='text-2xl font-bold text-white'>
                {formatCurrency(totalReceitas)}
              </h3>
            </div>
          </div>
          <div className='bg-[#111111] rounded-2xl p-6 border border-neutral-800/50 flex items-center gap-5'>
            <div className='bg-red-500/10 p-4 rounded-xl'>
              <TrendingDown className='w-7 h-7 text-red-500' />
            </div>
            <div>
              <p className='text-[11px] font-bold text-neutral-500 uppercase tracking-widest'>
                Saídas
              </p>
              <h3 className='text-2xl font-bold text-white'>
                {formatCurrency(totalDespesas)}
              </h3>
            </div>
          </div>
          <div
            className={`rounded-2xl p-6 border flex items-center gap-5 ${saldo >= 0 ? "bg-[#111111] border-emerald-900/30" : "bg-[#111111] border-red-900/30"}`}>
            <div
              className={`p-4 rounded-xl ${saldo >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              <Wallet
                className={`w-7 h-7 ${saldo >= 0 ? "text-emerald-500" : "text-red-500"}`}
              />
            </div>
            <div>
              <p className='text-[11px] font-bold text-neutral-500 uppercase tracking-widest'>
                Saldo
              </p>
              <h3
                className={`text-2xl font-bold ${saldo >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatCurrency(saldo)}
              </h3>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          <CategorySection categoryKey='receitas' />
          <CategorySection categoryKey='fixas' />
          <CategorySection categoryKey='parcelados' />
          <CategorySection categoryKey='variaveis' />
          <CategorySection categoryKey='impostos' />
          <CategorySection categoryKey='objetivos' />
        </div>
      </main>
    </div>
  );
}
