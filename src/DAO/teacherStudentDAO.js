const teacherModel = require("../models/teacher.model");
const studentModel = require("../models/student.model");
const Sequelize = require("sequelize");

const studentInArr = (onlyStudents) => {
  const studentsInArr = onlyStudents.map((eachStudent) => {
    return eachStudent["students"];
  });
  return { students: studentsInArr };
};

const registerTeacherStudent = async (teacherInput, studentInput) => {
  const [registeredTeacher, created] = await teacherModel.findOrCreate({
    where: {
      teacher: teacherInput,
    },
  });
  for (let i = 0; i < studentInput.length; i++) {
    const [registeredStudent, created] = await studentModel.findOrCreate({
      where: {
        students: studentInput[i],
      },
    });
    await registeredStudent.addTeacher(registeredTeacher);
  }
};

const manyTeachersCommonStudent = async (teacherQuery, numberofTeachers) => {
  const allTeacherStudents = await teacherModel.findAll({
    where: {
      teacher: teacherQuery,
    },
    attributes: ["teacher"],
    include: {
      model: studentModel,
      attributes: ["students"],
      through: { attributes: [] },
    },
    group: ["students"],
    having: Sequelize.literal(`COUNT(students) = ${numberofTeachers}`),
  });
  const onlyStudents = allTeacherStudents[0].students;
  return studentInArr(onlyStudents);
};

const singleTeacherStudents = async (teacherQuery) => {
  const oneTeacherStudents = await teacherModel.findOne({
    where: {
      teacher: teacherQuery,
    },
    attributes: ["teacher"],
    include: {
      model: studentModel,
      attributes: ["students"],
      through: { attributes: [] },
    },
  });
  if (!oneTeacherStudents) {
    throw new Error("Teacher input unavailable or invalid.");
  }
  const onlyStudents = oneTeacherStudents.students;
  return studentInArr(onlyStudents);
};

module.exports = {
  registerTeacherStudent,
  manyTeachersCommonStudent,
  singleTeacherStudents,
};