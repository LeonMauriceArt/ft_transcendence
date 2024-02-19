import * as tf from '@tensorflow/tfjs';

class PongAI {
    constructor() {
        this.model = this.createModel();
        this.memory = [];
        this.currentAction = 2;
        this.lastDecisionTime = Date.now();
        this.epsilon = 1;
        this.epsilonMin = 0.01;
        this.epsilonDecay = 0.995;
    }

    createModel() {
        const model = tf.sequential();
    
        model.add(tf.layers.dense({units: 128, activation: 'relu', inputShape: [9]}));
        model.add(tf.layers.dense({units: 256, activation: 'relu'}));
        model.add(tf.layers.dense({units: 256, activation: 'relu'}));
        model.add(tf.layers.dense({units: 3, activation: 'softmax'}));
    
        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
    
        return model;
    }

    displayMemory() {
        console.log(this.memory);
    }

    remember(state, action, reward, nextState) {
        this.memory.push({
            state: state,
            action: action,
            reward: reward,
            nextState: nextState
        });
        const maxSize = 10000;
        if (this.memory.length > maxSize) {
            this.memory.shift();
        }
    }
    
    actionToOneHot(action) {
        return Array.from({length: actionsCount}, (_, i) => i === action ? 1 : 0);
    }

    updateEpsilon() {
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }

    async decideAction(currentState) {
        if (Math.random() < this.epsilon) {
            const randomAction = Math.floor(Math.random() * 3);
            return randomAction;
        } else {
            const stateTensor = tf.tensor2d([currentState]);
            const predictions = await this.model.predict(stateTensor).data();
            stateTensor.dispose();
            return predictions.indexOf(Math.max(...predictions));
        }
    }

    reward(rewardValue) {
        if (this.memory.length > 0) {
            let lastExperience = this.memory[this.memory.length - 1];
            if (lastExperience.reward != null) {
                lastExperience.reward += rewardValue;
            } else {
                lastExperience.reward = rewardValue;
            }
        }
    }
}

export default PongAI;
