import { useState, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { ITodoData } from '@src/types/todoTypes';
import styled from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import useDate from '@src/hooks/useDate';
import { useDeleteTodoQuery, useUpdateTodoQuery } from '@src/hooks/query/todo';
import customToast from '@src/utils/customToast';

const TodoItem = ({ id, title, content, createdAt, updatedAt }: ITodoData) => {
  const toast = customToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const createdDate = useDate(createdAt);
  const updatedDate = useDate(updatedAt);

  const [isReadOnly, setIsReadOnly] = useState(true);

  const [todo, setTodo] = useState({
    title: title,
    content: content,
  });

  const { title: oldTitle, content: oldContent } = todo;

  const onChangeTodoTitle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const todoTitle = e.target.value;
      setTodo((prev) => {
        return { ...prev, title: todoTitle };
      });
    },
    [todo],
  );

  const onChangeTodoContent = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const todoValue = e.target.value;
      setTodo((prev) => {
        return { ...prev, content: todoValue };
      });
    },
    [todo],
  );

  const handleTodoById = useCallback(() => {
    isReadOnly && router.push(`/${id}`, undefined, { scroll: false });
  }, [isReadOnly, router]);

  const handleModiActive = () => setIsReadOnly(false);
  const handleReadOnly = () => setIsReadOnly(true);

  const { mutate: onTodoItemUpdate } = useUpdateTodoQuery({
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['todoList']);
        toast.success('수정 성공');
      },
    },
    todoId: id,
    todo: todo,
    errorHandler: (message: string) => toast.error(message),
  });

  const { mutate: onTodoItemDelete } = useDeleteTodoQuery({
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['todoList']);
        toast.success('삭제 성공');
      },
    },
    todoId: id,
    errorHandler: (message: string) => toast.error(message),
  });

  const CheckReallyDeleteTodoItem = async () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      onTodoItemDelete(id);
    }
  };

  const handleTodoUpdate = async () => {
    onTodoItemUpdate({
      todoId: id,
      todo: todo,
    });
    handleReadOnly();
  };

  const cancelTodo = () => {
    setTodo({
      title: title,
      content: content,
    });
    setIsReadOnly(true);
  };

  return (
    <>
      <Container onClick={handleTodoById}>
        <InputWrapper
          isTitle={true}
          placeholder="제목을 입력해주세요"
          value={oldTitle}
          onChange={onChangeTodoTitle}
          isReadOnly={isReadOnly}
        />
        <div className="row">
          <InputWrapper
            isTitle={false}
            placeholder="내용을 입력해주세요"
            value={oldContent}
            onChange={onChangeTodoContent}
            isReadOnly={isReadOnly}
          />
        </div>

        <p>최초 생성일: {createdDate}</p>
        <p>수정일: {updatedDate}</p>
      </Container>
      <ButtonWrapper isDanger={true} isCorrect={true} onClick={CheckReallyDeleteTodoItem}>
        삭제
      </ButtonWrapper>
      <ButtonWrapper isDanger={false} isCorrect={true} onClick={isReadOnly ? handleModiActive : handleTodoUpdate}>
        {isReadOnly ? '수정' : '제출'}
      </ButtonWrapper>

      {!isReadOnly && (
        <ButtonWrapper isDanger={false} isCorrect={true} onClick={cancelTodo}>
          취소
        </ButtonWrapper>
      )}
    </>
  );
};

export default TodoItem;

const Container = styled.li`
  cursor: pointer;
  &:hover {
    background-color: var(--mainOpacity);
  }
  margin-bottom: 20px;
  border: 1px solid var(--main2);
  border-radius: 10px;
  padding: 15px;
  .row {
    display: flex;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 16px;
  }
`;

const ButtonWrapper = styled(Button)<{ isDanger: boolean }>`
  background: ${({ isDanger }) => (isDanger ? 'var(--danger)' : 'var(--main)')};
  color: ${({ isDanger }) => (isDanger ? 'black' : 'black')};
  width: auto;
  margin-right: 4px;
`;

const InputWrapper = styled(Input)<{ isReadOnly: boolean; isTitle: boolean }>`
  width: 300px;
  margin-right: 10px;
  margin-bottom: 4px;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'pointer' : 'text')};
  background: ${({ isReadOnly }) => (isReadOnly ? 'white' : 'var(--mainOpacity)')};
  border: ${({ isReadOnly }) => (isReadOnly ? 'none' : '1px solid var(--main)')};
  font-size: ${({ isTitle }) => (isTitle ? '1.5rem' : '1rem')};
  font-weight: ${({ isTitle }) => (isTitle ? 'bold' : 'normal')};
`;
