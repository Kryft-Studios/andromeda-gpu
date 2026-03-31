const getBindGroupsInfo = /@group\(([\d]+)\)[\s\n]*@binding\(([\d]+)\)[\s\n]*var(?:<([A-Za-z]+)>)?[\s\n]*([A-Za-z0-9_]+)[\s\n]*:[\s\n]*([A-Za-z0-9_<>\s\n]+);/g;
