import numpy as np
import sklearn
import matplotlib.pyplot as plt

class logreg:
    
    def __init__(self,weightmatrix,bias,lr,epochs): # constructor
        self.weightmatrix = weightmatrix
        self.bias = bias
        self.lr = lr
        self.epochs = epochs

    def forwardpass(self,testinput):
        return (np.dot(testinput,self.weightmatrix)+self.bias)

    def sigmoid(self,z):#logistic part
        return 1/(1+np.exp(-z))
    
    def bceloss(self,predictions,labels):
        loss = -(labels*np.log(predictions)+(1-labels)*np.log(1-predictions))
        return np.mean(loss)
    
    def backprop(self,predictions,labels,input):
        dw = (1/len(input))*np.dot(input.T,(predictions-labels))
        db = np.mean(predictions-labels)
        #update
        self.weightmatrix = self.weightmatrix - self.lr*dw
        self.bias = self.bias - self.lr*db

    def training(self,X,labels,ax): 
        for epoch in range(self.epochs):
            #plot
            
            z = self.forwardpass(X)  
            predicted = self.sigmoid(z)
            loss = self.bceloss(predicted,labels)
            print(f"epoch:{epoch}, loss:{loss}")
            #update
            self.backprop(predicted,labels,X)
            #plot
            plt.pause(0.01)

    def predict(self, input):
        z = self.forwardpass(input)
        sigm = self.sigmoid(z)
        prediction = (sigm>0.5).astype(int)

        return prediction


# linearly seperable dataset (high acc)
# from sklearn.datasets import load_breast_cancer
# from sklearn.preprocessing import StandardScaler
# from sklearn.model_selection import train_test_split

# data = load_breast_cancer()
# X, y = data.data, data.target

# scaler = StandardScaler()
# X = scaler.fit_transform(X)

# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# non linearly seperable(low acc)
from sklearn.datasets import make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=1000, noise=0.3, random_state=42)

scaler = StandardScaler()
X = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

weights = np.zeros(X_train.shape[1])
bias = 0

plt.ion()
fig, ax = plt.subplots()
ax.scatter(X_train[:,0] ,X_train[:,1],c=y_train,label ="training")
ax.set_xlabel("Training data")
ax.set_ylabel("Labels")
ax.legend()
plt.show()

model = logreg(weights, bias, lr=0.01, epochs=1000)
model.training(X_train, y_train,ax)


predictions = model.predict(X_test)
accuracy = np.mean(predictions == y_test) * 100
print(f"Accuracy:{accuracy}")


