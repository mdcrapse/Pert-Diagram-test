document.addEventListener('DOMContentLoaded', () => {

    class UIController {
        constructor() {
            this.checkButton = document.getElementById('check-btn');
            this.graphContainer = document.getElementById('graph-container');

            this.engine = new SimulationEngine();
            this.graphRenderer = new GraphRenderer(this.graphContainer);
            this.soundManager = new SoundManager();
            this.animationManager = new AnimationManager(this.soundManager);

            this.taskData = this.engine.getTaskLayout();
            
            this.graphRenderer.drawEmptyQuiz(this.taskData);

            this.checkButton.addEventListener('click', () => this.onCheckClick());
        }

        onCheckClick() {
            console.log("Check button clicked.");
            this.soundManager.playSound('click');
            this.graphRenderer.clearFeedback(); 

            const correctAnswers = this.engine.runSimulation();
            
            let allCorrect = true;
            
            for (const taskId in correctAnswers) {
                const task = correctAnswers[taskId];
                
                const userAnswers = this.graphRenderer.getUserAnswers(taskId);
                
                const fieldsToCkeck = ['es', 'ef', 'ls', 'lf', 'slack'];
                fieldsToCkeck.forEach(field => {
                    
                    if (userAnswers[field] == task[field]) {
                        this.graphRenderer.showFeedback(taskId, field, true);
                    } else {
                        this.graphRenderer.showFeedback(taskId, field, false); 
                        allCorrect = false;
                    }
                });
            }
            
            if (allCorrect) {
                console.log("All answers correct! Playing animation.");
                this.animationManager.playCriticalPathAnimation(correctAnswers);
                this.soundManager.playSound('success_chime');
            }
        }
    }

    class SimulationEngine {
        
        getTaskLayout() {
            return {
                'A': { id: 'A', len: 5, pred: [],       succ: ['B', 'C'], x: '10%', y: '160px' },
                'B': { id: 'B', len: 5, pred: ['A'],    succ: ['D'],      x: '30%', y: '50px'  },
                'C': { id: 'C', len: 3, pred: ['A'],    succ: ['D'],      x: '30%', y: '270px' },
                'D': { id: 'D', len: 4, pred: ['B', 'C'], succ: ['E', 'F'],x: '50%', y: '160px' },
                'E': { id: 'E', len: 5, pred: ['D'],    succ: ['G'],      x: '70%', y: '50px'  },
                'F': { id: 'F', len: 3, pred: ['D'],    succ: ['G'],      x: '70%', y: '270px' },
                'G': { id: 'G', len: 6, pred: ['E', 'F'], succ: [],       x: '88%', y: '160px' }
            };
        }

        runSimulation() {

            const tasks = JSON.parse(JSON.stringify(this.getTaskLayout()));
            const taskOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

            let projectFinishTime = 0;
            for (const taskId of taskOrder) {
                const task = tasks[taskId];
                let maxPredEF = 0;
                for (const predId of task.pred) {
                    if (tasks[predId].ef > maxPredEF) {
                        maxPredEF = tasks[predId].ef;
                    }
                }
                task.es = maxPredEF;
                task.ef = task.es + task.len;
                if (task.ef > projectFinishTime) {
                    projectFinishTime = task.ef;
                }
            }

            const reverseTaskOrder = [...taskOrder].reverse();
            for (const taskId of reverseTaskOrder) {
                const task = tasks[taskId];
                if (task.succ.length === 0) {
                    task.lf = projectFinishTime;
                } else {
                    let minSuccLS = Infinity;
                    for (const succId of task.succ) {
                        if (tasks[succId].ls < minSuccLS) {
                            minSuccLS = tasks[succId].ls;
                        }
                    }
                    task.lf = minSuccLS;
                }
                task.ls = task.lf - task.len;
            }

            for (const taskId of taskOrder) {
                const task = tasks[taskId];
                task.slack = task.ls - task.es;
            }
            
            return tasks; 
        }
    }

    class GraphRenderer {
        constructor(graphContainer) {
            this.container = graphContainer;
        }

        drawEmptyQuiz(tasks) {
            for (const taskId in tasks) {
                const task = tasks[taskId];
                const nodeElement = document.createElement('div');
                nodeElement.className = 'pert-node';
                nodeElement.id = `task-${task.id}`;
                nodeElement.style.left = task.x;
                nodeElement.style.top = task.y;

                nodeElement.innerHTML = `
                    <div class="es"><input type="text" id="task-${task.id}-es"></div>
                    <div class="dur">${task.len}</div>
                    <div class="ef"><input type="text" id="task-${task.id}-ef"></div>
                    
                    <div class="task-name">${task.id}</div>
                    
                    <div class="ls"><input type="text" id="task-${task.id}-ls"></div>
                    <div class="slack"><input type="text" id="task-${task.id}-slack"></div>
                    <div class="lf"><input type="text" id="task-${task.id}-lf"></div>
                `;
                this.container.appendChild(nodeElement);
            }
        }

        getUserAnswers(taskId) {
            return {
                es: document.getElementById(`task-${taskId}-es`).value,
                ef: document.getElementById(`task-${taskId}-ef`).value,
                ls: document.getElementById(`task-${taskId}-ls`).value,
                lf: document.getElementById(`task-${taskId}-lf`).value,
                slack: document.getElementById(`task-${taskId}-slack`).value
            };
        }

        showFeedback(taskId, field, isCorrect) {
            const inputElement = document.getElementById(`task-${taskId}-${field}`);
            if (inputElement) {
                inputElement.classList.add(isCorrect ? 'correct' : 'wrong');
            }
        }

        clearFeedback() {
            const inputs = document.querySelectorAll('.pert-node input');
            inputs.forEach(input => {
                input.classList.remove('correct', 'wrong');
            });
            const nodes = document.querySelectorAll('.pert-node');
            nodes.forEach(node => {
                node.classList.remove('critical-highlight');
            });
        }
    }

    class AnimationManager {
        constructor(soundManager) {
            this.soundManager = soundManager;
        }
        
        playCriticalPathAnimation(correctTasks) {
            for (const taskId in correctTasks) {
                // Use the REAL critical path logic
                if (correctTasks[taskId].slack === 0) {
                    const nodeElement = document.getElementById(`task-${taskId}`);
                    if (nodeElement) {
                        nodeElement.classList.add('critical-highlight');
                    }
                }
            }
        }
    }

    class SoundManager {
        playSound(soundName) {
            console.log(`%cSOUND: Playing '${soundName}'`, 'color: blue; font-weight: bold;');
        }
    }

    new UIController();

});