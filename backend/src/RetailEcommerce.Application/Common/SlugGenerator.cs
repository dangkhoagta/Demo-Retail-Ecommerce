using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace RetailEcommerce.Application.Common;

/// <summary>Produces URL-friendly slugs, with Vietnamese diacritics folded to ASCII.</summary>
public static partial class SlugGenerator
{
    public static string Generate(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Đ/đ are not decomposed by normalization, handle explicitly.
        input = input.Replace('Đ', 'D').Replace('đ', 'd');

        var normalized = input.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        var slug = sb.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
        slug = NonAlphaNumeric().Replace(slug, "-");
        slug = MultiDash().Replace(slug, "-").Trim('-');
        return slug;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonAlphaNumeric();

    [GeneratedRegex("-{2,}")]
    private static partial Regex MultiDash();
}
