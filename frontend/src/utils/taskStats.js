export const getTaskStats = (tasks) => {
  const stats = {
    todo: 0,
    inProgress: 0,
    done: 0,
    total: tasks.length,
  };

  tasks.forEach((task) => {
    if (task.status === "To Do") stats.todo++;
    else if (task.status === "In Progress") stats.inProgress++;
    else if (task.status === "Done") stats.done++;
  });

  stats.completedPercentage = stats.total
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  return stats;
};
