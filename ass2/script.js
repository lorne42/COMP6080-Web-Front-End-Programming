// Helper function to validate full name length
function validateFullName(name) {
    return name.length >= 3 && name.length <= 50;
}

// Helper function to validate date format (DD/MM/YYYY)
function validateDate(date) {
    const regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
    if (!regex.test(date)) {
        return false;
    }
    const [day, month, year] = date.split('/').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    return parsedDate.getDate() === day && parsedDate.getMonth() === month - 1 && parsedDate.getFullYear() === year;
}

// Helper function to calculate age
function calculateAge(dob) {
    const [day, month, year] = dob.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDifference = now.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && now.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Validate Graduation Date (must be after Date of Birth)
function validateGraduationDate(dob, gradDate) {
    const [dobDay, dobMonth, dobYear] = dob.split('/').map(Number);
    const birthDate = new Date(dobYear, dobMonth - 1, dobDay);
    const graduationDate = new Date(gradDate);
    return graduationDate > birthDate;
}

// Validate "Other" field (4 uppercase letters followed by 4 numbers)
function validateOtherField(value) {

    const regex = /^[A-Z]{4}[0-9]{4}$/;
    return regex.test(value);
}

document.addEventListener('DOMContentLoaded', () => {
    const fullNameInput = document.querySelector('#fullName');
    const dobInput = document.querySelector('#dob');
    const gradDateInput = document.querySelector('#graduationDate');
    const coursesCheckboxes = document.querySelectorAll('.favCoursesContainer input[type="checkbox"]:not(#selectAll)');
    const otherInput = document.querySelector('#other');
    const selectAllCheckbox = document.querySelector('#selectAll');
    const resetButton = document.querySelector('#resetButton');
    const summaryTextarea = document.querySelector('#outputText');

    // 调试: 确认 textarea 被正确获取
    console.log(summaryTextarea);  // 应该输出 textarea DOM 元素

    function renderSummary() {
        const fullName = fullNameInput.value;
        const dob = dobInput.value;
        const gradDate = gradDateInput.value;
        const other = otherInput.value;

        // 调试: 打印输入值
        console.log('Full Name:', fullName);
        console.log('Date of Birth:', dob);
        console.log('Graduation Date:', gradDate);
        console.log('Other:', other);
        

        // 验证
        if (!validateFullName(fullName) || !validateDate(dob) || !validateGraduationDate(dob, gradDate)) {
            console.log(!validateFullName(fullName));
            console.log(!validateDate(dob));
            console.log(!validateGraduationDate(dob, gradDate));
            console.log(!validateOtherField(other));
            summaryTextarea.value = '';  // 验证不通过时清空输出
            console.log('sum:',summaryTextarea);
            return;
        }

        const age = calculateAge(dob);
        const graduationDate = new Date(gradDate).toDateString().slice(4); // 格式化毕业日期 "Jan 01 2024"
        let courses = [];

        // 收集选中的课程
        coursesCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                courses.push(checkbox.name);
            }
        });

        // 如果 "Other" 字段有效，加入课程
        if (validateOtherField(other)) {
            courses.push(other);
        }

        // 生成课程总结
        let coursesText = '';
        if (courses.length === 1) {
            coursesText = `my favourite course is ${courses[0]}`;
        } else if (courses.length === 2) {
            coursesText = `my favourite courses are ${courses[0]} and ${courses[1]}`;
        } else if (courses.length > 2) {
            coursesText = `my favourite courses are ${courses.slice(0, -1).join(', ')}, and ${courses[courses.length - 1]}`;
        }

        // 生成总结
        if (courses.length) {
            const summary = `My name is ${fullName} and I am ${age} years old. I graduate on ${graduationDate}, and ${coursesText}.`;
            console.log('Summary:', summary);
            summaryTextarea.value = summary;
        }
        // 调试: 打印生成的总结
          // 更新 textarea 的值
    }

    // 绑定事件监听器
    fullNameInput.addEventListener('blur', renderSummary);
    dobInput.addEventListener('blur', renderSummary);
    gradDateInput.addEventListener('blur', renderSummary);
    otherInput.addEventListener('input', renderSummary);

    // 课程复选框
    coursesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // 每次点击单个复选框时都调用 renderSummary 更新汇总
            renderSummary();
            
            // 检查是否所有课程复选框都选中
            let allChecked = true;
            coursesCheckboxes.forEach(cb => {
                if (!cb.checked) {
                    allChecked = false;
                }
            });
            
            selectAllCheckbox.checked = allChecked; // 如果全部选中，则勾选全选复选框
        });

        
    });

    // "Select All" 功能
    selectAllCheckbox.addEventListener('change', () => {
        coursesCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        renderSummary();
    });

    // 重置按钮
    resetButton.addEventListener('click', () => {
        fullNameInput.value = '';
        dobInput.value = '';
        gradDateInput.value = '';
        otherInput.value = '';
        coursesCheckboxes.forEach(checkbox => checkbox.checked = false);
        selectAllCheckbox.checked = false;
        summaryTextarea.value = '';
    });
});
