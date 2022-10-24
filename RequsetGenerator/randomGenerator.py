import math
import random

class RandomGenerator(object):
    def __init__(self, seed):
        self.seed = seed
        
    def __eq__(self, other):
        return type(self) == type(other) and self.seed == other.seed

    def __hash__(self):
        return self.seed
        
    def copy(self):
        return RandomGenerator(self.seed)

    def __wrapFunction(self, func, args):
        random.seed(self.seed)
        val = getattr(random, func)(*args)
        self.seed = random.random()
        return val

    def uniform(self, a):
        return self.__wrapFunction("uniform", [0, a])

    def random(self):
        return self.__wrapFunction("random", [])

    def iuniform(self,lo, hi=None):
        if hi is None:
            return self.__wrapFunction("iuniform",[0,lo])
        else:
            return round(self.__wrapFunction("uinfrom",[lo,hi]))
    
    def expon(self, mean):
        return -mean*math.log(self.uniform(1))

    def normal1(self):
        u = self.uniform(1)
        return math.sqrt(-2*math.log(u))*math.cos(2*math.pi*u)
    
    def normal(self,mean,sig):
        save = mean + sig*self.normal1()
        return save

    def posNormal(self,mean,sig):
        save = self.normal(mean,sig)
        return save
    
    def pareto(self,locatoin,shape):
        u = self.uniform(1)
        return locatoin*math.pow(u,(-1/shape))

    def lognormal(self,mean,sig):
        return math.pow(10,self.normal(mean,sig))
