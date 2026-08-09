import { validate } from 'class-validator';
import { GetUsersQueryDto } from './get-users-query.dto';
import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';
describe('GetUsersQueryDto', () => {
  it('should default page and limit when omitted in query params', async () => {
    const dto = plainToInstance(GetUsersQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(6);
  });

  it('should transform query params from string to number', async () => {
    const dto = plainToInstance(GetUsersQueryDto, { page: '2', limit: '6' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(6);
  });

  it('rejects non-numeric page', async () => {
    const dto = plainToInstance(GetUsersQueryDto, { page: 'abc' });
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects page less than 1', async () => {
    const dto = plainToInstance(GetUsersQueryDto, { page: '0' });
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
