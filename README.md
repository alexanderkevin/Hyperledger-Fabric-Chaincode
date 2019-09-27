# Hyperledger Fabric Chaincode

This is the chaincode part that will interact directly with the Blockchain Ledger. The chaincode would be available to the outer system through the 
[Hyperledger Fabric MS](https://github.com/alexanderkevin/Hyperledger-Fabric-MS)

The chaincode will be divided into three smart contracts(on the lib folder) that is divided by each object role.

This chaincode is prebuild from the [IBM Blockchain Platform](https://cloud.ibm.com/docs/services/blockchain?topic=blockchain-develop-vscode) plugins for Visual Studio code.

>Click on the link to learn how to setup and work with the plugin

It is **highly reccomended** to install the plugins and use Visual Studio code for the code editor to build and test this App.

The Plugins will help us to rapidly build and test chaincode as it will handle the install, instansiate, docker image and other underlaying process that are fundamental to make sure the Hyperledger Fabric up and running.

## The Story
Someday a `Person` is going to buy a `Car`. The Person would need to `Register` itself on the blockchain before he can buy that dream car.

>The System will Invoke the `/person/register` 

After the Person data has been recorded on Blockchain, He will `Request` a car to be made.

>The System will Invoke the `/car/requestCar`

The manufacturer would then start to `Make` the requested car.

>The System will invoke the `/car/manufacture/{id}`

After the car has been made then the manufacturer would let the person `Buy` the car

>The System will Invoke the `/transaction/buyCar`

Voila! now the car are permanently recorded on the blockchain for that person

If the Person want to see when and what are the `History` of the car. He can directly refer to the ledger on the blockchain.

>The System will provide all of the history of the block by Invoking `/car/history/{id}`

Someday the person decided to `Transfer` the car to his son and so The Sytem will ... (we will let you figure this part yourself)


## How to run
This section will provide explanation on how to run the chaincode side of the application locally on your machine. 

### Step 1

Import the project to your Visual Studio Code

### Step 2

Install all of the dependency
```
npm install
```

### Step 3

Instansiate the project
> This part expect you to have succesfully installed the [IBM Blockchain Platform](https://cloud.ibm.com/docs/services/blockchain?topic=blockchain-develop-vscode) plugins 

1. In your Visual Studio Code click on the IBM Blockchain Platform icon (on the side bar)
2. On the right most of the Smart Contract click on the ... icon and choose `Package open project`
>if you open several folder on your current VS Code workspace, choose the initiative folder
3. After the notification that pop up finish, Go to the Fabric Environments and expand the `Instantiated` 
4. Click on the `+ Instantiate` choose the `Initiative` folder. Then leave all the option blank by pressing enter on every prompt.
> In the case you have done any changes and want to `Upgrade your smartcontract` then right click on the already instantiate `initiative@{previous version}` and choose upgrade smart contract.
5. Wait for sometimes and you are good to go when there are a notification pop up saying that you've succesfully instantiated the chaincode.

### Step 4

Run the [Hyperledger Fabric MS](https://github.com/alexanderkevin/Hyperledger-Fabric-MS) part to interact with this chaincode and to run the story told above.

### Extra Step
In case you just want to see how the chaincode works, you can directly test some function in the VS code by clicking the IBM Blockchain Plugin than go to `Fabric Gateways` > Channels > mychannel > initiative@1.0.0 > CarContract > requestCar> right click and choose submit transaction> Copy this exact String to record Car 1

```
["CAR_1","{\"manufacture\":\"TOYOTA\",\"year\":2019,\"name\":\"INNOVA\"}"]
```

To see whether it has been recorded or not you can invoke the queryAllCar > Right click then choose submit transaction > `<press enter>` since no need for additional param

Voila your blockchain chaincode has been installed succesfully!

## Brief Explanation
This section will give you a little bit of background of what each Smart Contract do

### CarContract
This smart contract is a basic CRUD for Car Asset. It can:
* Request Car (create record of car)
* Manufacture the Car (update record of car)
* See Car's Status
* Get list of all cars
* Get block history of specific car
* Delete Car Record

### PersonContract
This smart contract is a basic CRUD for Person Asset. It can:
* Create Person
* Update Person
* See Person Data
* See all cars that belong to specific Person
* Get list of all Persons
* Get block history of specific Person
* Delete Person Record

### TransactionContract
This smart contract kind of the `stored procedure` in the sense of traditional database. It can:
* Buy new Car
* Transfer Car's ownership