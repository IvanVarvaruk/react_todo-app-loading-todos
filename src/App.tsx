/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState, useMemo } from 'react';
import { UserWarning } from './UserWarning';
import * as todoApi from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const loadTodos = () => {
    setErrorMessage('');
    todoApi
      .getTodos()
      .then(fetchedTodos => {
        setTodos(fetchedTodos);
      })
      .catch(() => setErrorMessage('Unable to load todos'));
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const visibleTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filter === 'active') {
        return !todo.completed;
      }

      if (filter === 'completed') {
        return todo.completed;
      }

      return true;
    });
  }, [todos, filter]);

  const activeCount = useMemo(() => {
    return todos.filter(todo => !todo.completed).length;
  }, [todos]);

  const completedCount = useMemo(() => {
    return todos.filter(todo => todo.completed).length;
  }, [todos]);

  if (!todoApi.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {todos.length > 0 && (
            <button
              type="button"
              className="todoapp__toggle-all active"
              data-cy="ToggleAllButton"
            />
          )}

          <form
            onSubmit={event => {
              event.preventDefault();
              const trimmedTitle = inputValue.trim();

              if (!trimmedTitle) {
                setErrorMessage('Title should not be empty');

                return;
              }

              setErrorMessage('');
              todoApi
                .addTodo({
                  userId: todoApi.USER_ID,
                  title: trimmedTitle,
                  completed: false,
                })
                .then(newTodo => {
                  setTodos(prev => [...prev, newTodo]);
                  setInputValue('');
                })
                .catch(() => {
                  setErrorMessage('Unable to add a todo');
                });
            }}
          >
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
              autoFocus
            />
          </form>
        </header>

        {todos.length > 0 && (
          <section className="todoapp__main" data-cy="TodoList">
            {visibleTodos.map(todo => (
              <div
                key={todo.id}
                data-cy="Todo"
                className={classNames('todo', {
                  completed: todo.completed,
                })}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>

                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            ))}
          </section>
        )}

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {`${activeCount} items left`}
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: filter === 'all',
                })}
                data-cy="FilterLinkAll"
                onClick={() => setFilter('all')}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: filter === 'active',
                })}
                data-cy="FilterLinkActive"
                onClick={() => setFilter('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: filter === 'completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => setFilter('completed')}
              >
                Completed
              </a>
            </nav>

            {completedCount > 0 && (
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
              >
                Clear completed
              </button>
            )}
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification',
          'is-danger',
          'is-light',
          'has-text-weight-normal',
          {
            hidden: !errorMessage,
          },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
