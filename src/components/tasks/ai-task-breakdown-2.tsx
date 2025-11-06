'use client';

/**
 * AI Task Breakdown 2.0
 * Visual tree structure with drag-and-drop reordering, auto-suggestions,
 * and time estimation learning for ADHD-optimized task management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Clock,
  Zap,
  Brain,
  Sparkles,
  GripVertical,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GlassCard } from '@/components/design/GlassCard';
import { AnimatedNumber } from '@/components/design/AnimatedNumber';
import type {
  TaskTreeNode,
  MicroStep,
  TimeEstimate,
  TaskCompletionPrediction,
} from '@/types/adhd-task-system';

interface AITaskBreakdown2Props {
  taskTitle: string;
  taskDescription?: string;
  estimatedTime?: number;
  energyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  difficulty?: number;
  onSave: (tree: TaskTreeNode) => void;
  onCancel: () => void;
  userId: string;
  executiveFunctionScores?: {
    planning: number;
    workingMemory: number;
    inhibition: number;
    flexibility: number;
    timeManagement: number;
    selfMonitoring: number;
  };
}

const ENERGY_COLORS = {
  LOW: 'text-blue-500 bg-blue-500/20',
  MEDIUM: 'text-purple-500 bg-purple-500/20',
  HIGH: 'text-orange-500 bg-orange-500/20',
};

const ENERGY_ICONS = {
  LOW: '🧘',
  MEDIUM: '⚡',
  HIGH: '🔥',
};

export function AITaskBreakdown2({
  taskTitle,
  taskDescription,
  estimatedTime,
  energyLevel,
  difficulty,
  onSave,
  onCancel,
  userId,
  executiveFunctionScores,
}: AITaskBreakdown2Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [taskTree, setTaskTree] = useState<TaskTreeNode | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [learningData, setLearningData] = useState<TimeEstimate[]>([]);
  const [predictions, setPredictions] = useState<TaskCompletionPrediction | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);

  // Fetch AI breakdown on mount
  useEffect(() => {
    fetchAIBreakdown();
    fetchLearningData();
  }, [taskTitle, taskDescription]);

  const fetchAIBreakdown = async () => {
    if (!taskTitle) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/breakdown-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          estimatedTime,
          energyLevel,
          difficulty,
          executiveFunctionScores,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTaskTree(data.tree);
        setAiSuggestion(data.suggestion);
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Failed to fetch AI breakdown:', error);
      // Create a basic structure as fallback
      createBasicTree();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLearningData = async () => {
    try {
      const response = await fetch(`/api/tasks/learning-data?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLearningData(data.estimates || []);
      }
    } catch (error) {
      console.error('Failed to fetch learning data:', error);
    }
  };

  const createBasicTree = () => {
    const basicTree: TaskTreeNode = {
      id: 'root',
      title: taskTitle,
      microSteps: [],
      subTasks: [],
      energyCost: energyLevel === 'HIGH' ? 4 : energyLevel === 'MEDIUM' ? 3 : 2,
      estimatedTime: estimatedTime || 30,
      completed: false,
      collapsed: false,
    };
    setTaskTree(basicTree);
  };

  const toggleCollapse = (nodeId: string) => {
    if (!taskTree) return;

    const updateNode = (node: TaskTreeNode): TaskTreeNode => {
      if (node.id === nodeId) {
        return { ...node, collapsed: !node.collapsed };
      }
      return {
        ...node,
        subTasks: node.subTasks.map(updateNode),
      };
    };

    setTaskTree(updateNode(taskTree));
  };

  const addMicroStep = (nodeId: string) => {
    if (!taskTree) return;

    const newStep: MicroStep = {
      id: `step-${Date.now()}`,
      step: 'New step',
      estimatedTime: 5,
      energyLevel: 'MEDIUM',
      completed: false,
      order: 0,
    };

    const updateNode = (node: TaskTreeNode): TaskTreeNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          microSteps: [...node.microSteps, { ...newStep, order: node.microSteps.length }],
        };
      }
      return {
        ...node,
        subTasks: node.subTasks.map(updateNode),
      };
    };

    setTaskTree(updateNode(taskTree));
  };

  const addSubTask = (nodeId: string) => {
    if (!taskTree) return;

    const newSubTask: TaskTreeNode = {
      id: `subtask-${Date.now()}`,
      title: 'New subtask',
      microSteps: [],
      subTasks: [],
      energyCost: 2,
      estimatedTime: 15,
      completed: false,
      collapsed: false,
    };

    const updateNode = (node: TaskTreeNode): TaskTreeNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          subTasks: [...node.subTasks, newSubTask],
        };
      }
      return {
        ...node,
        subTasks: node.subTasks.map(updateNode),
      };
    };

    setTaskTree(updateNode(taskTree));
  };

  const updateMicroStep = (nodeId: string, stepId: string, updates: Partial<MicroStep>) => {
    if (!taskTree) return;

    const updateNode = (node: TaskTreeNode): TaskTreeNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          microSteps: node.microSteps.map(step =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
        };
      }
      return {
        ...node,
        subTasks: node.subTasks.map(updateNode),
      };
    };

    setTaskTree(updateNode(taskTree));
  };

  const deleteMicroStep = (nodeId: string, stepId: string) => {
    if (!taskTree) return;

    const updateNode = (node: TaskTreeNode): TaskTreeNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          microSteps: node.microSteps.filter(step => step.id !== stepId),
        };
      }
      return {
        ...node,
        subTasks: node.subTasks.map(updateNode),
      };
    };

    setTaskTree(updateNode(taskTree));
  };

  const deleteSubTask = (parentId: string, subTaskId: string) => {
    if (!taskTree) return;

    const updateNode = (node: TaskTreeNode): TaskTreeNode => {
      if (node.id === parentId) {
        return {
          ...node,
          subTasks: node.subTasks.filter(sub => sub.id !== subTaskId),
        };
      }
      return {
        ...node,
        subTasks: node.subTasks.map(updateNode),
      };
    };

    setTaskTree(updateNode(taskTree));
  };

  const reorderMicroSteps = (nodeId: string, newOrder: MicroStep[]) => {
    if (!taskTree) return;

    const updateNode = (node: TaskTreeNode): TaskTreeNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          microSteps: newOrder.map((step, index) => ({ ...step, order: index })),
        };
      }
      return {
        ...node,
        subTasks: node.subTasks.map(updateNode),
      };
    };

    setTaskTree(updateNode(taskTree));
  };

  const getNextMicroStepSuggestion = async (nodeId: string, currentSteps: MicroStep[]) => {
    try {
      const response = await fetch('/api/ai/suggest-next-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle,
          currentSteps: currentSteps.map(s => s.step),
          context: taskDescription,
        }),
      });

      if (response.ok) {
        const { suggestion } = await response.json();
        const newStep: MicroStep = {
          id: `step-${Date.now()}`,
          step: suggestion.step,
          description: suggestion.description,
          estimatedTime: suggestion.estimatedTime,
          energyLevel: suggestion.energyLevel,
          completed: false,
          order: currentSteps.length,
        };

        const updateNode = (node: TaskTreeNode): TaskTreeNode => {
          if (node.id === nodeId) {
            return {
              ...node,
              microSteps: [...node.microSteps, newStep],
            };
          }
          return {
            ...node,
            subTasks: node.subTasks.map(updateNode),
          };
        };

        setTaskTree(updateNode(taskTree!));
      }
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    }
  };

  const calculateAccuracy = useMemo(() => {
    if (learningData.length === 0) return 0;
    const scores = learningData
      .filter(est => est.accuracyScore !== null && est.accuracyScore !== undefined)
      .map(est => est.accuracyScore!);
    return scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
      : 0;
  }, [learningData]);

  const getTotalTime = (node: TaskTreeNode): number => {
    const microStepTime = node.microSteps.reduce((sum, step) => sum + step.estimatedTime, 0);
    const subTaskTime = node.subTasks.reduce((sum, sub) => sum + getTotalTime(sub), 0);
    return microStepTime + subTaskTime;
  };

  const renderTreeNode = (node: TaskTreeNode, depth: number = 0, parentId?: string) => {
    const totalTime = getTotalTime(node);
    const hasContent = node.microSteps.length > 0 || node.subTasks.length > 0;

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`ml-${depth * 4} mb-2`}
      >
        <GlassCard variant="light" className="p-4">
          {/* Node header */}
          <div className="flex items-start gap-3">
            {hasContent && (
              <button
                onClick={() => toggleCollapse(node.id)}
                className="mt-1 text-gray-500 hover:text-gray-700"
              >
                {node.collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={node.title}
                  onChange={(e) => {
                    const updateNode = (n: TaskTreeNode): TaskTreeNode => {
                      if (n.id === node.id) return { ...n, title: e.target.value };
                      return { ...n, subTasks: n.subTasks.map(updateNode) };
                    };
                    setTaskTree(taskTree ? updateNode(taskTree) : null);
                  }}
                  className="flex-1 font-medium"
                />

                <Badge className={ENERGY_COLORS[energyLevel]}>
                  {ENERGY_ICONS[energyLevel]} {node.energyCost}/5
                </Badge>

                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {totalTime}m
                </Badge>
              </div>

              {/* Micro-steps */}
              {!node.collapsed && node.microSteps.length > 0 && (
                <Reorder.Group
                  axis="y"
                  values={node.microSteps}
                  onReorder={(newOrder) => reorderMicroSteps(node.id, newOrder)}
                  className="space-y-2 mt-3"
                >
                  {node.microSteps.map((step) => (
                    <Reorder.Item
                      key={step.id}
                      value={step}
                      className="flex items-start gap-2 p-3 bg-white/50 rounded-lg border border-gray-200"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 mt-1 cursor-grab active:cursor-grabbing" />

                      <div className="flex-1">
                        <Input
                          value={step.step}
                          onChange={(e) =>
                            updateMicroStep(node.id, step.id, { step: e.target.value })
                          }
                          className="mb-1 text-sm"
                          placeholder="Step description"
                        />

                        {step.description && (
                          <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                        )}

                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={step.estimatedTime}
                            onChange={(e) =>
                              updateMicroStep(node.id, step.id, {
                                estimatedTime: parseInt(e.target.value) || 5,
                              })
                            }
                            className="w-20 text-xs"
                            min={1}
                            max={120}
                          />
                          <span className="text-xs text-gray-500">min</span>

                          <select
                            value={step.energyLevel}
                            onChange={(e) =>
                              updateMicroStep(node.id, step.id, {
                                energyLevel: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH',
                              })
                            }
                            className="text-xs px-2 py-1 rounded border border-gray-300"
                          >
                            <option value="LOW">Low Energy</option>
                            <option value="MEDIUM">Medium Energy</option>
                            <option value="HIGH">High Energy</option>
                          </select>

                          {step.executiveFunctionChallenge && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              {step.executiveFunctionChallenge}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMicroStep(node.id, step.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              {/* Action buttons */}
              {!node.collapsed && (
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addMicroStep(node.id)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Step
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSubTask(node.id)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Subtask
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => getNextMicroStepSuggestion(node.id, node.microSteps)}
                    className="gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Suggest
                  </Button>
                </div>
              )}

              {/* Sub-tasks */}
              {!node.collapsed && node.subTasks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {node.subTasks.map((subTask) => (
                    <div key={subTask.id} className="relative">
                      {renderTreeNode(subTask, depth + 1, node.id)}
                      {parentId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubTask(node.id, subTask.id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4" />
        <p className="text-gray-600">AI is analyzing your task...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with predictions */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Task Breakdown</h3>
          <p className="text-sm text-gray-600 mt-1">{aiSuggestion}</p>
        </div>

        {learningData.length > 0 && (
          <GlassCard variant="light" className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium">Your Estimation Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={calculateAccuracy} className="flex-1" />
              <AnimatedNumber value={Math.round(calculateAccuracy)} className="text-sm font-bold" />
              <span className="text-xs text-gray-500">%</span>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Predictions card */}
      {predictions && (
        <GlassCard variant="medium" className="p-4">
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="font-medium">AI Predictions</span>
              <Badge variant="outline">
                {Math.round(predictions.confidence * 100)}% confidence
              </Badge>
            </div>
            {showPredictions ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>

          {showPredictions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600">Estimated Time</p>
                  <p className="text-lg font-bold text-purple-600">
                    {predictions.estimatedCompletionTime} min
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Similar Tasks</p>
                  <p className="text-lg font-bold text-purple-600">
                    {predictions.similarTasksData.count}
                  </p>
                </div>
              </div>

              {predictions.similarTasksData.count > 0 && (
                <div className="text-xs text-gray-600">
                  <p>Based on {predictions.similarTasksData.count} similar tasks</p>
                  <p>Average time: {predictions.similarTasksData.averageTime} min</p>
                  <p>Your accuracy: {Math.round(predictions.similarTasksData.userAccuracyScore * 100)}%</p>
                </div>
              )}
            </motion.div>
          )}
        </GlassCard>
      )}

      {/* Task tree */}
      <div className="space-y-2">
        {taskTree ? (
          renderTreeNode(taskTree)
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No breakdown available. Creating basic structure...</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => taskTree && onSave(taskTree)}
          disabled={!taskTree}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          Save Breakdown
        </Button>
      </div>
    </div>
  );
}
