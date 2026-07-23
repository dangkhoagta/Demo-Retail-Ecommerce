using System.Linq.Expressions;
using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Application.Interfaces.Repositories;

/// <summary>Generic repository over an aggregate. Concrete repos add query-specific methods.</summary>
public interface IRepository<T> where T : AuditableEntity
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<T>> ListAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
}
