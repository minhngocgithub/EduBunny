import {
  AdminQuizQuerySchema,
  CreateQuestionSchema,
  CreateQuizSchema,
  SaveAnswerSchema,
  SubmitAnswersSchema,
} from '@modules/quiz/quiz.dto';

describe('Quiz DTO Schemas', () => {
  it('parses valid admin query with defaults', () => {
    const parsed = AdminQuizQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it('validates create quiz payload', () => {
    const payload = {
      courseId: '11111111-1111-1111-1111-111111111111',
      title: 'Quiz 1',
      duration: 30,
    };

    const parsed = CreateQuizSchema.parse(payload);
    expect(parsed.passingScore).toBe(70);
    expect(parsed.maxAttempts).toBe(3);
    expect(parsed.isActive).toBe(true);
  });

  it('rejects invalid question payload', () => {
    expect(() =>
      CreateQuestionSchema.parse({
        type: 'MULTIPLE_CHOICE',
        question: '',
        correctAnswer: 'A',
      })
    ).toThrow();
  });

  it('validates submit and save answer payloads', () => {
    const submit = SubmitAnswersSchema.parse({
      attemptId: '22222222-2222-2222-2222-222222222222',
      answers: [{ questionId: '33333333-3333-3333-3333-333333333333', answer: '42' }],
    });

    const save = SaveAnswerSchema.parse({
      questionId: '33333333-3333-3333-3333-333333333333',
      answer: '42',
    });

    expect(submit.answers).toHaveLength(1);
    expect(save.answer).toBe('42');
  });
});
