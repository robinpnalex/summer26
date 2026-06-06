# Simple logistic regression from scratch

built using numpy

## implementation
- sigmoid activation
- binary cross entropy loss
- backprop
- gradient descent

# stuff I learnt
### binary cross entropy/log loss
    The more likely an event is to occur the less information it requires to convey that event.

    Information can be calculated as
        h(x) = -log(P(x))
    where P(x) is the probability of the event

    Entropy is the average information you get for an event in a probability distribution.
    A skewed distribution(lower uncertainty) will have lower entropy than a balanced one.
    Entropy would be:
    H(X) = – sum x in X P(x) * log(P(x))

    Cross entropy is the average information for an event from one distribution to another.

    Intuition-
    ".... if we consider a target or underlying probability distribution P and an approximation of the target distribution Q, then the cross-entropy of Q from P is the number of additional bits to represent an event using Q instead of P." - https://machinelearningmastery.com/cross-entropy-for-machine-learning/


    Cross entropy as error fuction
    For classification problems each test-input has a class label with probability of 1, and 0 for the other labels.Using an activation function like sigmoid we  estimate the probability of an input belonging to each label. Cross entropy can then be used to calculate the difference between the two distributions.


# how to run

    pip install numpy scikit-learn
    python3 regression.py
